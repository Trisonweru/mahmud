import { describe, it, expect } from "vitest";
import { isEmail, monthsBetween, isPassportExpiryValid, todayStr } from "@/lib/validation";

describe("isEmail", () => {
  it("accepts standard valid addresses", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("first.last@domain.co.uk")).toBe(true);
    expect(isEmail("user+tag@gmail.com")).toBe(true);
    expect(isEmail("  padded@test.com  ")).toBe(true); // trimmed
  });

  it("rejects malformed addresses", () => {
    expect(isEmail("notanemail")).toBe(false);
    expect(isEmail("@nodomain.com")).toBe(false);
    expect(isEmail("no-at-sign.com")).toBe(false);
    expect(isEmail("a@b.c")).toBe(false);    // TLD < 2 chars
    expect(isEmail("")).toBe(false);
    expect(isEmail("spaces in@email.com")).toBe(false);
  });
});

describe("monthsBetween", () => {
  it("counts 6 months between Jan and Jul same year", () => {
    expect(monthsBetween(new Date(2025, 0, 1), new Date(2025, 6, 1))).toBe(6);
  });

  it("handles year boundary (Dec → Jan)", () => {
    expect(monthsBetween(new Date(2024, 11, 1), new Date(2025, 0, 1))).toBe(1);
  });

  it("returns 0 for same month", () => {
    expect(monthsBetween(new Date(2025, 3, 10), new Date(2025, 3, 28))).toBe(0);
  });

  it("returns negative when b is before a", () => {
    expect(monthsBetween(new Date(2026, 0, 1), new Date(2025, 0, 1))).toBe(-12);
  });

  it("returns 5 not 6 when the day-of-month hasn't passed (e.g. Jun 20 → Dec 19)", () => {
    // Without day-awareness this would incorrectly return 6
    expect(monthsBetween(new Date(2025, 5, 20), new Date(2025, 11, 19))).toBe(5);
  });

  it("returns 6 when day-of-month exactly matches (Jun 20 → Dec 20)", () => {
    expect(monthsBetween(new Date(2025, 5, 20), new Date(2025, 11, 20))).toBe(6);
  });

  it("handles multi-year spans", () => {
    expect(monthsBetween(new Date(2020, 0, 1), new Date(2025, 0, 1))).toBe(60);
  });
});

describe("isPassportExpiryValid", () => {
  const future = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  };

  it("accepts expiry more than 6 months ahead", () => {
    expect(isPassportExpiryValid(future(7))).toBe(true);
    expect(isPassportExpiryValid(future(12))).toBe(true);
    expect(isPassportExpiryValid(future(24))).toBe(true);
  });

  it("rejects expiry less than 6 months ahead", () => {
    expect(isPassportExpiryValid(future(3))).toBe(false);
    expect(isPassportExpiryValid(future(1))).toBe(false);
  });

  it("rejects exactly 5 months ahead", () => {
    expect(isPassportExpiryValid(future(5))).toBe(false);
  });

  it("rejects empty and invalid strings", () => {
    expect(isPassportExpiryValid("")).toBe(false);
    expect(isPassportExpiryValid("not-a-date")).toBe(false);
    expect(isPassportExpiryValid("00-00-0000")).toBe(false);
  });

  it("rejects past dates", () => {
    expect(isPassportExpiryValid("2020-01-01")).toBe(false);
  });
});

describe("todayStr", () => {
  it("returns today in YYYY-MM-DD format", () => {
    const result = todayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toISOString().slice(0, 10));
  });
});
