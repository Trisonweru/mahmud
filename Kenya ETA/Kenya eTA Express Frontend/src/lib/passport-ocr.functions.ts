
// Client-side passport OCR (no server round-trip, no third-party AI gateway).
// Runs Tesseract.js entirely in the browser: one pass over the full page for
// visual-zone label fallbacks, and a dedicated upscaled pass over just the
// bottom MRZ strip, since MRZ text is tiny relative to the full page.

// Thrown when a file can't be decoded as a raster image in-browser (e.g. PDF
// or HEIC/HEIF on some devices). Tesseract cannot read these formats
// directly, and passing them through causes an uncaught worker error.
export class UnsupportedImageError extends Error {
  constructor() {
    super("UNSUPPORTED_IMAGE_FORMAT");
    this.name = "UnsupportedImageError";
  }
}

export type PassportScan = {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  passportNumber: string;
  passportIssueDate: string; // YYYY-MM-DD
  passportExpiry: string; // YYYY-MM-DD
  nationality: string;
  nationalityCode: string; // ISO 3166-1 alpha-3, as printed in the MRZ
  countryOfBirth: string;
  countryOfBirthCode: string;
  sex: string;
};

export type PassportScanResult = { ok: true; scan: PassportScan } | { ok: false; message: string };

function hasExtractedData(s: PassportScan): boolean {
  return Boolean(
    s.fullName || s.passportNumber || s.nationality || s.dateOfBirth || s.passportExpiry || s.sex,
  );
}

const MONTHS: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

// Convert MRZ YYMMDD to YYYY-MM-DD. assumeFuture=true treats <50 as 20xx (expiry).
export function _mrzDate(yymmdd: string, assumeFuture = false): string | undefined {
  if (!/^\d{6}$/.test(yymmdd)) return undefined;
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const now = new Date().getFullYear() % 100;
  let year: number;
  if (assumeFuture) year = 2000 + yy;
  else year = yy > now + 5 ? 1900 + yy : 2000 + yy;
  if (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12) return undefined;
  if (parseInt(dd, 10) < 1 || parseInt(dd, 10) > 31) return undefined;
  return `${year}-${mm}-${dd}`;
}

export function _parseHumanDate(s: string): string | undefined {
  // 12 JAN 2030 / 12-JAN-2030 / 12/01/2030
  const m1 = s.match(/(\d{1,2})[\s/.-]+([A-Z]{3})[\s/.-]+(\d{4})/);
  if (m1 && MONTHS[m1[2]!]) return `${m1[3]}-${MONTHS[m1[2]!]}-${m1[1]!.padStart(2, "0")}`;
  const m2 = s.match(/(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2]!.padStart(2, "0")}-${m2[1]!.padStart(2, "0")}`;
  return undefined;
}

// MRZ date fields (DOB/expiry) are strictly 6 digits, but small/blurry scans
// often get OCR'd with letters that look like digits. Since these positions
// can never legitimately contain letters, it's safe to normalize them.
export function _fixMrzDigits(s: string): string {
  return s
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/G/g, "6");
}

function applyGrayscaleContrast(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    const v = Math.max(0, Math.min(255, (g - 128) * 1.4 + 128));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(id, 0, 0);
}

// Full-page scan, downsized for speed, used for visual-zone fallback fields.
function buildFullCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const maxW = 1600;
  const scale = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  applyGrayscaleContrast(ctx, w, h);
  return c;
}

// Crops the bottom strip of the photo page (where the MRZ lives) and upscales
// it. The MRZ text is tiny relative to the full page, so a dedicated,
// enlarged pass on just that strip reads far more reliably than the full image.
function buildMrzCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const cropFraction = 0.32;
  const srcY = Math.round(img.height * (1 - cropFraction));
  const srcW = img.width;
  const srcH = img.height - srcY;
  const targetW = 2200;
  const scale = Math.min(4, Math.max(1, targetW / srcW));
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, srcY, srcW, srcH, 0, 0, w, h);
  applyGrayscaleContrast(ctx, w, h);
  return c;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new UnsupportedImageError());
      i.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function parseOcrText(fullText: string, mrzPassText: string): PassportScan {
  const upper = `${fullText}\n${mrzPassText}`.toUpperCase();
  const lines = [mrzPassText, fullText]
    .map((t) => t.toUpperCase().split(/\r?\n/))
    .flat()
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Partial<PassportScan> = {};
  let surname: string | undefined;
  let givenNames: string | undefined;

  // --- Try MRZ (TD3 passport: two 44-char lines starting with P) ---
  const mrzLines = lines
    .map((l) => l.replace(/\s+/g, ""))
    .map((l) => l.match(/^[A-Z0-9<]+/)?.[0] || "")
    .filter((l) => l.length >= 30);
  const mrz1 = mrzLines.find((l) => l.startsWith("P"));
  const mrz2 = mrz1 ? mrzLines.find((l) => l !== mrz1 && /\d/.test(l)) : undefined;

  if (mrz1 && mrz2) {
    const country = mrz1.substring(2, 5);
    const namePart = mrz1.substring(5).replace(/<+$/g, "");
    let surnameRaw: string | undefined;
    let givenRaw: string | undefined;
    const strictSegments = namePart.split("<<");
    if (strictSegments.length >= 2 && strictSegments[0] && strictSegments[1]) {
      [surnameRaw, givenRaw] = strictSegments;
    } else {
      const looseSegments = namePart.split(/<+/).filter(Boolean);
      if (looseSegments.length >= 2) {
        surnameRaw = looseSegments[0];
        givenRaw = looseSegments.slice(1).join(" ");
      }
    }
    if (surnameRaw && givenRaw) {
      surname = surnameRaw.replace(/</g, " ").trim();
      givenNames = givenRaw.replace(/</g, " ").trim();
      result.fullName = [givenNames, surname].filter(Boolean).join(" ");
    }
    result.nationality = country;
    result.nationalityCode = country;

    const passNum = mrz2.substring(0, 9).replace(/</g, "").replace(/O/g, "0");
    if (passNum) result.passportNumber = passNum;

    const natIdx = mrz2.indexOf(country, 8);
    if (natIdx !== -1) {
      const dob = _fixMrzDigits(mrz2.substring(natIdx + 3, natIdx + 9));
      const dobIso = _mrzDate(dob, false);
      if (dobIso) result.dateOfBirth = dobIso;
      const sex = mrz2[natIdx + 10];
      if (sex === "M" || sex === "F") result.sex = sex;
      const exp = _fixMrzDigits(mrz2.substring(natIdx + 11, natIdx + 17));
      const expIso = _mrzDate(exp, true);
      if (expIso) result.passportExpiry = expIso;
    }
  }

  // --- Fallback: parse visual zone labels ---
  if (!result.passportNumber) {
    const m = upper.match(/PASSPORT\s*(?:NO|NUMBER)\.?\s*[:-]?\s*([A-Z0-9]{6,12})/);
    if (m) result.passportNumber = m[1]!;
  }
  if (!result.dateOfBirth) {
    const m = upper.match(
      /(?:DATE OF BIRTH|BIRTH|DOB)[^\n]*?([0-3]?\d[\s/.-][A-Z0-9]+[\s/.-]\d{2,4})/,
    );
    const parsed = m ? _parseHumanDate(m[1]!) : undefined;
    if (parsed) result.dateOfBirth = parsed;
  }
  if (!result.passportExpiry) {
    const m = upper.match(
      /(?:DATE OF EXPIRY|EXPIRY|EXPIRES)[^\n]*?([0-3]?\d[\s/.-][A-Z0-9]+[\s/.-]\d{2,4})/,
    );
    const parsed = m ? _parseHumanDate(m[1]!) : undefined;
    if (parsed) result.passportExpiry = parsed;
  }
  // The MRZ doesn't encode the issue date, so this is visual-zone only.
  {
    const m = upper.match(/(?:DATE OF ISSUE|ISSUE)[^\n]*?([0-3]?\d[\s/.-][A-Z0-9]+[\s/.-]\d{2,4})/);
    const parsed = m ? _parseHumanDate(m[1]!) : undefined;
    if (parsed) result.passportIssueDate = parsed;
  }
  // The MRZ doesn't encode place of birth either — visual-zone only, and not
  // every passport design prints it.
  {
    const m = upper.match(/(?:PLACE OF BIRTH|BIRTHPLACE)[\s:]+([A-Z\- ]{2,})/);
    const found = m?.[1]?.trim().split(/\s{2,}/)[0];
    if (found) result.countryOfBirth = found;
  }
  if (!surname) {
    const m = upper.match(/SURNAME[\s:]+([A-Z\- ]{2,})/);
    const found = m?.[1]?.trim().split(/\s{2,}/)[0];
    if (found) surname = found;
  }
  if (!givenNames) {
    const m = upper.match(/GIVEN\s*NAMES?[\s:]+([A-Z\- ]{2,})/);
    const found = m?.[1]?.trim().split(/\s{2,}/)[0];
    if (found) givenNames = found;
  }
  if (!result.fullName && (surname || givenNames)) {
    result.fullName = [givenNames, surname].filter(Boolean).join(" ").trim();
  }
  if (!result.sex) {
    const m = upper.match(/SEX[A-Z/\s]*[:-]?\s*([MF])\b/);
    const sex = m?.[1];
    if (sex === "M" || sex === "F") result.sex = sex;
  }

  return {
    fullName: result.fullName ?? "",
    dateOfBirth: result.dateOfBirth ?? "",
    passportNumber: result.passportNumber ?? "",
    passportIssueDate: result.passportIssueDate ?? "",
    passportExpiry: result.passportExpiry ?? "",
    nationality: result.nationality ?? "",
    nationalityCode: result.nationalityCode ?? "",
    countryOfBirth: result.countryOfBirth ?? "",
    countryOfBirthCode: "",
    sex: result.sex ?? "",
  };
}

export async function scanPassport(file: File): Promise<PassportScanResult> {
  if (!file.type.startsWith("image/")) {
    return {
      ok: false,
      message: "Please upload a photo of your passport (JPEG, PNG or similar) rather than a PDF.",
    };
  }

  try {
    const img = await loadImage(file);
    const fullCanvas = buildFullCanvas(img);
    const mrzCanvas = buildMrzCanvas(img);

    // Loaded on demand: tesseract.js references Node's __dirname at import time,
    // which crashes server rendering on Cloudflare Workers (the whole /apply page
    // then rendered empty for search engines). It only ever runs in the browser.
    const { default: Tesseract } = await import("tesseract.js");
    const [mrzPass, fullPass] = await Promise.all([
      Tesseract.recognize(mrzCanvas, "eng"),
      Tesseract.recognize(fullCanvas, "eng"),
    ]);

    const scan = parseOcrText(fullPass.data.text || "", mrzPass.data.text || "");
    if (!hasExtractedData(scan)) {
      return { ok: false, message: "No details could be read. Please type them in." };
    }
    return { ok: true, scan };
  } catch {
    return { ok: false, message: "Could not read the passport. Please type your details." };
  }
}
