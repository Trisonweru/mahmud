import { describe, it, expect, beforeEach } from "vitest";
import { setPending, getPending, clearPending } from "@/lib/pendingApplication";

describe("pendingApplication", () => {
  beforeEach(() => {
    clearPending();
    sessionStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getPending()).toBeNull();
  });

  it("stores and retrieves a pending application", () => {
    setPending({ flow: "standard", application_id: "abc-123", email: "test@test.com" });
    const result = getPending();
    expect(result).not.toBeNull();
    expect(result?.flow).toBe("standard");
    expect(result?.application_id).toBe("abc-123");
    expect(result?.email).toBe("test@test.com");
  });

  it("persists string fields to sessionStorage", () => {
    setPending({ flow: "express", email: "user@example.com", fullName: "Ali Hassan" });
    const raw = sessionStorage.getItem("pendingApplication");
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.flow).toBe("express");
    expect(stored.email).toBe("user@example.com");
  });

  it("excludes File objects from sessionStorage", () => {
    const file = new File(["data"], "passport.jpg", { type: "image/jpeg" });
    setPending({ flow: "standard", passport: file, email: "a@b.com" });
    const raw = sessionStorage.getItem("pendingApplication");
    const stored = JSON.parse(raw!);
    expect("passport" in stored).toBe(false);
    expect(stored.email).toBe("a@b.com");
  });

  it("clears in-memory state and sessionStorage", () => {
    setPending({ flow: "standard", email: "x@x.com" });
    clearPending();
    expect(getPending()).toBeNull();
    expect(sessionStorage.getItem("pendingApplication")).toBeNull();
  });

  it("falls back to sessionStorage when in-memory is cleared", () => {
    sessionStorage.setItem(
      "pendingApplication",
      JSON.stringify({ flow: "express", email: "stored@test.com" }),
    );
    const result = getPending();
    expect(result?.flow).toBe("express");
    expect(result?.email).toBe("stored@test.com");
  });

  it("returns the same object on repeated calls without re-parsing", () => {
    setPending({ flow: "standard", email: "repeat@test.com" });
    const a = getPending();
    const b = getPending();
    expect(a).toBe(b); // same reference — no double-parse
  });
});
