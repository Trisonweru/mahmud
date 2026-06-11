import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Status from "@/pages/Status";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </HelmetProvider>
);

function renderStatus() {
  return render(<Status />, { wrapper: Wrapper });
}

function mockFetch(statusValue: string, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: async () => (ok ? { ok: true, reference: "SV123456", status: statusValue } : { ok: false }),
    }),
  );
}

async function search(email = "a@b.com", ref = "SV123456") {
  fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/application reference/i), { target: { value: ref } });
  fireEvent.click(screen.getByRole("button", { name: /check status/i }));
}

describe("Status page", () => {
  // The rate limiter in Status.tsx is module-level: 5 searches per 60 seconds.
  // We mock Date.now() to advance by 2 minutes before each test so the window
  // always resets, while leaving real Promise/setTimeout queues untouched so
  // waitFor() can still resolve normally.
  let mockedNow = Date.now() + 120_000;
  beforeEach(() => {
    mockedNow += 120_000;
    vi.spyOn(Date, "now").mockReturnValue(mockedNow);
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders the search form with email and reference inputs", () => {
    renderStatus();
    expect(screen.getByPlaceholderText(/email address/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/application reference/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /check status/i })).toBeTruthy();
  });

  it("displays Approved status with correct message", async () => {
    mockFetch("approved");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText("Approved")).toBeTruthy());
    expect(screen.getByText(/evisa has been sent/i)).toBeTruthy();
  });

  it("displays Denied status for rejected applications", async () => {
    mockFetch("rejected");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText("Denied")).toBeTruthy());
    expect(screen.getByText(/notification has been sent/i)).toBeTruthy();
  });

  it("displays Info Required from us (additional_info) with amber 'From Us' badge", async () => {
    mockFetch("additional_info");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText("Info Required")).toBeTruthy());
    // Correct message wording
    expect(screen.getByText(/from our team/i)).toBeTruthy();
    // Badge clearly labels the source
    expect(screen.getByText(/from us/i)).toBeTruthy();
  });

  it("displays Government Info Required with distinct indigo 'Government' badge", async () => {
    mockFetch("government_info_required");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText("Government Info Required")).toBeTruthy());
    // Distinct message mentioning the government
    expect(screen.getByText(/somali government/i)).toBeTruthy();
    // Badge says Government, not From Us
    expect(screen.getByText(/^government$/i)).toBeTruthy();
    expect(screen.queryByText(/from us/i)).toBeNull();
  });

  it("shows the error message when the lookup returns no match", async () => {
    mockFetch("", false);
    renderStatus();
    await search("unknown@test.com", "NOSUCHREF");
    await waitFor(() =>
      expect(screen.getByText(/no matching application found/i)).toBeTruthy()
    );
  });

  it("shows a Pending status for submitted applications", async () => {
    mockFetch("submitted");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText("Pending")).toBeTruthy());
    expect(screen.getByText(/pending review/i)).toBeTruthy();
  });

  it("displays the application reference number in the result card", async () => {
    mockFetch("approved");
    renderStatus();
    await search();
    await waitFor(() => expect(screen.getByText(/SV123456/)).toBeTruthy());
  });
});
