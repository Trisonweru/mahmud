import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState as useReactState } from "react";
import { DateDropdown } from "@/components/DateDropdown";

// Stateful wrapper so the component re-renders when onChange fires
function Controlled({ initial = "", minYear = 1980, maxYear = 2040 }: { initial?: string; minYear?: number; maxYear?: number }) {
  const [value, setValue] = useReactState(initial);
  return <DateDropdown label="Test Date" value={value} onChange={setValue} minYear={minYear} maxYear={maxYear} />;
}

const MIN_YEAR = 1980;
const MAX_YEAR = 2040;

describe("DateDropdown", () => {
  it("renders three selects with the correct aria-labels", () => {
    render(<DateDropdown label="Date of Birth" value="" onChange={() => {}} minYear={MIN_YEAR} maxYear={MAX_YEAR} />);
    expect(screen.getByRole("combobox", { name: /day/i })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /month/i })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /year/i })).toBeTruthy();
  });

  it("pre-selects correct values when a YYYY-MM-DD string is passed", () => {
    render(<DateDropdown label="DOB" value="1990-06-15" onChange={() => {}} minYear={1900} maxYear={2025} />);
    const day   = screen.getByRole("combobox", { name: /day/i }) as HTMLSelectElement;
    const month = screen.getByRole("combobox", { name: /month/i }) as HTMLSelectElement;
    const year  = screen.getByRole("combobox", { name: /year/i }) as HTMLSelectElement;
    expect(day.value).toBe("15");
    expect(month.value).toBe("6");
    expect(year.value).toBe("1990");
  });

  it("emits updated date when a single field changes on an existing full date", () => {
    // Real-world usage: OCR pre-fills the date; user corrects one field
    render(<Controlled initial="1990-06-15" minYear={1980} maxYear={2040} />);
    fireEvent.change(screen.getByRole("combobox", { name: /year/i }), { target: { value: "2000" } });
    // Year updates; month and day stay as-is
    expect((screen.getByRole("combobox", { name: /year/i })  as HTMLSelectElement).value).toBe("2000");
    expect((screen.getByRole("combobox", { name: /month/i }) as HTMLSelectElement).value).toBe("6");
    expect((screen.getByRole("combobox", { name: /day/i })   as HTMLSelectElement).value).toBe("15");
  });

  it("clears back to empty string when a part is deselected", () => {
    render(<Controlled initial="2030-03-15" minYear={2024} maxYear={2040} />);
    fireEvent.change(screen.getByRole("combobox", { name: /month/i }), { target: { value: "" } });
    expect((screen.getByRole("combobox", { name: /month/i }) as HTMLSelectElement).value).toBe("");
  });

  it("clamps day when changing to a shorter month (Jan 31 → Feb)", () => {
    render(<Controlled initial="2025-01-31" minYear={2020} maxYear={2030} />);
    fireEvent.change(screen.getByRole("combobox", { name: /month/i }), { target: { value: "2" } });
    const dayVal = parseInt((screen.getByRole("combobox", { name: /day/i }) as HTMLSelectElement).value, 10);
    expect(dayVal).toBeGreaterThan(0);
    expect(dayVal).toBeLessThanOrEqual(28);
  });

  it("shows an error message when error prop is provided", () => {
    render(<DateDropdown label="DOB" value="" onChange={() => {}} error="Date is required" minYear={1900} maxYear={2025} />);
    expect(screen.getByText("Date is required")).toBeTruthy();
  });

  it("only renders years within minYear–maxYear range", () => {
    render(<DateDropdown label="Issue Date" value="" onChange={() => {}} minYear={2000} maxYear={2005} />);
    const yearSelect = screen.getByRole("combobox", { name: /year/i });
    const options = Array.from((yearSelect as HTMLSelectElement).options).map(o => o.value);
    expect(options).toContain("2000");
    expect(options).toContain("2005");
    expect(options).not.toContain("1999");
    expect(options).not.toContain("2006");
  });
});
