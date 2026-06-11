import Tesseract from "tesseract.js";

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

async function preprocess(file: File): Promise<HTMLCanvasElement | File> {
  if (!file.type.startsWith("image/")) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const maxW = 1600;
    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    // grayscale + contrast boost
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
      const v = Math.max(0, Math.min(255, (g - 128) * 1.4 + 128));
      d[i] = d[i+1] = d[i+2] = v;
    }
    ctx.putImageData(id, 0, 0);
    return c;
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function extractPassport(
  file: File,
  onProgress?: (p: number) => void,
): Promise<PassportData> {
  const input = await preprocess(file);
  const { data } = await Tesseract.recognize(input as any, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
    },
  } as any);
  const text = data.text || "";
  const upper = text.toUpperCase();
  const lines = upper.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const result: PassportData = { rawText: text };

  // --- Try MRZ (TD3 passport: two 44-char lines starting with P) ---
  const mrzLines = lines
    .map((l) => l.replace(/\s+/g, ""))
    .filter((l) => /^[A-Z0-9<]{30,}$/.test(l));
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
    const dob = mrz2.substring(13, 19);
    const dobIso = _mrzDate(dob, false);
    if (dobIso) result.dateOfBirth = dobIso;
    const sex = mrz2.substring(20, 21);
    if (sex === "M" || sex === "F") result.sex = sex;
    const exp = mrz2.substring(21, 27);
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
