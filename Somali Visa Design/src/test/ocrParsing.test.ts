import { describe, it, expect } from "vitest";
import { _mrzDate, _parseHumanDate, _parseOcrText } from "@/lib/passportOcr";

describe("_mrzDate (MRZ YYMMDD → YYYY-MM-DD)", () => {
  const thisYear = new Date().getFullYear() % 100;

  it("converts a standard MRZ dob in the past", () => {
    expect(_mrzDate("900115")).toBe("1990-01-15");
    expect(_mrzDate("850630")).toBe("1985-06-30");
  });

  it("converts an expiry date as future (assumeFuture=true)", () => {
    // Expiry dates: any 2-digit year is treated as 20xx when assumeFuture=true
    expect(_mrzDate("301231", true)).toBe("2030-12-31");
    expect(_mrzDate("250101", true)).toBe("2025-01-01");
  });

  it("returns undefined for non-6-digit input", () => {
    expect(_mrzDate("12345")).toBeUndefined();
    expect(_mrzDate("1234567")).toBeUndefined();
    expect(_mrzDate("ABCDEF")).toBeUndefined();
    expect(_mrzDate("")).toBeUndefined();
  });

  it("returns undefined for invalid month (00 or 13)", () => {
    expect(_mrzDate("900015")).toBeUndefined(); // month 00
    expect(_mrzDate("901315")).toBeUndefined(); // month 13
  });

  it("returns undefined for invalid day (00 or 32)", () => {
    expect(_mrzDate("900100")).toBeUndefined(); // day 00
    expect(_mrzDate("900132")).toBeUndefined(); // day 32
  });

  it("assigns 19xx to years clearly in the past (yy > currentYear+5)", () => {
    // yy=85: 85 > (thisYear % 100) + 5 for any foreseeable year → 1985
    expect(_mrzDate("850101")).toBe("1985-01-01");
    expect(_mrzDate("901231")).toBe("1990-12-31");
  });

  it("assigns 20xx to years close to now (yy <= currentYear+5)", () => {
    // yy=20: 20 <= 31 for 2026 → 2020
    expect(_mrzDate("200601")).toBe("2020-06-01");
  });
});

describe("_parseHumanDate (visual zone date parsing)", () => {
  it("parses DD MMM YYYY format", () => {
    expect(_parseHumanDate("12 JAN 2030")).toBe("2030-01-12");
    expect(_parseHumanDate("05 DEC 2028")).toBe("2028-12-05");
    expect(_parseHumanDate("01 MAY 2025")).toBe("2025-05-01");
  });

  it("parses DD-MMM-YYYY format", () => {
    expect(_parseHumanDate("15-MAR-2027")).toBe("2027-03-15");
    expect(_parseHumanDate("31-OCT-2031")).toBe("2031-10-31");
  });

  it("parses DD/MM/YYYY numeric format", () => {
    expect(_parseHumanDate("12/01/2030")).toBe("2030-01-12");
    expect(_parseHumanDate("01/06/2026")).toBe("2026-06-01");
  });

  it("returns undefined for unrecognised formats", () => {
    expect(_parseHumanDate("invalid")).toBeUndefined();
    expect(_parseHumanDate("")).toBeUndefined();
    expect(_parseHumanDate("2030-01-12")).toBeUndefined(); // ISO format not matched by visual parser
  });

  it("returns undefined for unknown month abbreviations", () => {
    expect(_parseHumanDate("12 XYZ 2030")).toBeUndefined();
  });
});

describe("_parseOcrText (full MRZ + visual zone parsing)", () => {
  // Captured from a real OCR pass on a sample Kenyan passport. The MRZ line2
  // here has the surname/given-names "<<" separator collapsed to a single
  // "<", and the passport number digits misread as the letter "O".
  const kenMrz1 = "P<KEN<HALISI<MKENYA<<<<<<<<<<<<<<<<<<<<<<<<<";
  const kenMrz2 = "AKOOOOOOOO<8KEN910101F0000001<<<<<<<<<<<<<<?";
  const kenFullText = "REPUBLIC OF KENYA\nP KEN AK000000000\nHALISI\nMKENYA";

  it("splits surname/given names when the MRZ '<<' separator collapses to '<'", () => {
    const result = _parseOcrText(kenFullText, `${kenMrz1}\n${kenMrz2}`);
    expect(result.surname).toBe("HALISI");
    expect(result.givenNames).toBe("MKENYA");
    expect(result.fullName).toBe("MKENYA HALISI");
  });

  it("normalizes O→0 digit confusions in the passport number", () => {
    const result = _parseOcrText(kenFullText, `${kenMrz1}\n${kenMrz2}`);
    expect(result.passportNumber).toBe("AK0000000");
  });

  it("re-anchors DOB/sex/expiry on the nationality code when offsets drift", () => {
    const result = _parseOcrText(kenFullText, `${kenMrz1}\n${kenMrz2}`);
    expect(result.nationality).toBe("KEN");
    expect(result.dateOfBirth).toBe("1991-01-01");
  });

  it("splits surname/given names normally when the MRZ '<<' separator is intact", () => {
    const mrz1 = "P<USASMITH<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<";
    const mrz2 = "AB1234567USA9001015M3001017<<<<<<<<<<<<<<04";
    const result = _parseOcrText("", `${mrz1}\n${mrz2}`);
    expect(result.surname).toBe("SMITH");
    expect(result.givenNames).toBe("JOHN");
    expect(result.nationality).toBe("USA");
    expect(result.passportNumber).toBe("AB1234567");
    expect(result.dateOfBirth).toBe("1990-01-01");
    expect(result.sex).toBe("M");
    expect(result.expiryDate).toBe("2030-01-01");
  });
});
