import Tesseract from "tesseract.js";

// Thrown when a file can't be decoded as a raster image in-browser (e.g. PDF or
// HEIC/HEIF on some devices). Tesseract cannot read these formats directly, and
// passing them through causes an uncaught worker error, so we bail out early.
export class UnsupportedImageError extends Error {
  constructor() {
    super("UNSUPPORTED_IMAGE_FORMAT");
    this.name = "UnsupportedImageError";
  }
}

export type PassportData = {
  surname?: string;
  givenNames?: string;
  fullName?: string;
  passportNumber?: string;
  nationality?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  expiryDate?: string;  // YYYY-MM-DD
  sex?: string;
  rawText: string;
};

// True if the scan yielded at least one usable field beyond the raw OCR text.
export function hasExtractedData(data: PassportData): boolean {
  return !!(
    data.surname || data.givenNames || data.passportNumber
    || data.nationality || data.dateOfBirth || data.expiryDate || data.sex
  );
}

const MONTHS: Record<string, string> = {
  JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
  JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
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
  if (m1 && MONTHS[m1[2]]) return `${m1[3]}-${MONTHS[m1[2]]}-${m1[1].padStart(2, "0")}`;
  const m2 = s.match(/(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
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
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
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
  c.width = w; c.height = h;
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
  c.width = w; c.height = h;
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

export async function extractPassport(
  file: File,
  onProgress?: (p: number) => void,
): Promise<PassportData> {
  // PDFs (and other non-raster files) can't be decoded to a canvas in-browser,
  // and feeding their raw bytes to Tesseract causes an uncaught worker error.
  if (!file.type.startsWith("image/")) {
    throw new UnsupportedImageError();
  }
  const img = await loadImage(file);
  const fullCanvas = buildFullCanvas(img);
  const mrzCanvas = buildMrzCanvas(img);

  const recognize = (canvas: HTMLCanvasElement, weight: number, offset: number) =>
    Tesseract.recognize(canvas as any, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) onProgress(offset + m.progress * weight);
      },
    } as any);

  const [mrzPass, fullPass] = await Promise.all([
    recognize(mrzCanvas, 0.5, 0),
    recognize(fullCanvas, 0.5, 0.5),
  ]);

  const mrzPassText = mrzPass.data.text || "";
  const fullText = fullPass.data.text || "";
  const text = `${fullText}\n${mrzPassText}`;
  const upper = text.toUpperCase();
  // MRZ-crop lines are checked first since the upscaled, dedicated pass is
  // far more reliable for the MRZ than the full-page pass.
  const lines = [mrzPassText, fullText]
    .map((t) => t.toUpperCase().split(/\r?\n/))
    .flat()
    .map((l) => l.trim())
    .filter(Boolean);

  const result: PassportData = { rawText: text };

  // --- Try MRZ (TD3 passport: two 44-char lines starting with P) ---
  // Take the longest leading run of valid MRZ characters per line, since OCR
  // often appends a stray character (e.g. a misread check digit) that would
  // otherwise fail a strict whole-line match.
  const mrzLines = lines
    .map((l) => l.replace(/\s+/g, ""))
    .map((l) => l.match(/^[A-Z0-9<]+/)?.[0] || "")
    .filter((l) => l.length >= 30);
  let mrz1 = mrzLines.find((l) => l.startsWith("P"));
  let mrz2 = mrz1 ? mrzLines.find((l) => l !== mrz1 && /\d/.test(l)) : undefined;

  if (mrz1 && mrz2) {
    const country = mrz1.substring(2, 5);
    const namePart = mrz1.substring(5).replace(/<+$/g, "");
    const [surnameRaw, givenRaw = ""] = namePart.split("<<");
    result.surname = surnameRaw.replace(/</g, " ").trim();
    result.givenNames = givenRaw.replace(/</g, " ").trim();
    result.fullName = [result.givenNames, result.surname].filter(Boolean).join(" ");
    result.nationality = country;

    const passNum = mrz2.substring(0, 9).replace(/</g, "");
    if (passNum) result.passportNumber = passNum;
    const dob = _fixMrzDigits(mrz2.substring(13, 19));
    const dobIso = _mrzDate(dob, false);
    if (dobIso) result.dateOfBirth = dobIso;
    const sex = mrz2.substring(20, 21);
    if (sex === "M" || sex === "F") result.sex = sex;
    const exp = _fixMrzDigits(mrz2.substring(21, 27));
    const expIso = _mrzDate(exp, true);
    if (expIso) result.expiryDate = expIso;
  }

  // --- Fallback: parse visual zone labels ---
  if (!result.passportNumber) {
    const m = upper.match(/PASSPORT\s*(?:NO|NUMBER)\.?\s*[:\-]?\s*([A-Z0-9]{6,12})/);
    if (m) result.passportNumber = m[1];
  }
  if (!result.dateOfBirth) {
    const m = upper.match(/(?:DATE OF BIRTH|BIRTH|DOB)[^\n]*?([0-3]?\d[\s/.-][A-Z0-9]+[\s/.-]\d{2,4})/);
    if (m) result.dateOfBirth = _parseHumanDate(m[1]);
  }
  if (!result.expiryDate) {
    const m = upper.match(/(?:DATE OF EXPIRY|EXPIRY|EXPIRES)[^\n]*?([0-3]?\d[\s/.-][A-Z0-9]+[\s/.-]\d{2,4})/);
    if (m) result.expiryDate = _parseHumanDate(m[1]);
  }
  if (!result.surname) {
    const m = upper.match(/SURNAME[\s:]+([A-Z\- ]{2,})/);
    if (m) result.surname = m[1].trim().split(/\s{2,}/)[0];
  }
  if (!result.givenNames) {
    const m = upper.match(/GIVEN\s*NAMES?[\s:]+([A-Z\- ]{2,})/);
    if (m) result.givenNames = m[1].trim().split(/\s{2,}/)[0];
  }
  if (!result.fullName && (result.surname || result.givenNames)) {
    result.fullName = [result.givenNames, result.surname].filter(Boolean).join(" ").trim();
  }

  return result;
}
