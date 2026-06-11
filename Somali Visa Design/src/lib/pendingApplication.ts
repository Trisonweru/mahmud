// Pending application payload held between form submission and payment confirmation.
// Strings are mirrored to sessionStorage so a page refresh on /payment doesn't wipe them.
// File objects can't be serialized, so they only live in the module variable; if the user
// refreshes, strings survive and the submission still goes through (files re-uploaded later if needed).

export type PendingApplication = Record<string, unknown> & {
  flow: "standard" | "express";
  application_id?: string;
};

const STORAGE_KEY = "pendingApplication";

let pending: PendingApplication | null = null;

function loadFromStorage(): PendingApplication | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingApplication;
  } catch {
    return null;
  }
}

function persistStrings(data: PendingApplication) {
  try {
    const serializable: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v instanceof File) continue;
      if (v == null) continue;
      serializable[k] = v;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // ignore quota / serialization errors
  }
}

export function setPending(data: PendingApplication) {
  pending = data;
  persistStrings(data);
}

export function getPending(): PendingApplication | null {
  if (pending) return pending;
  // Fallback: reconstruct from sessionStorage (no files) so a refresh still works.
  const fromStorage = loadFromStorage();
  if (fromStorage) {
    pending = fromStorage;
    return pending;
  }
  return null;
}

export function clearPending() {
  pending = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
