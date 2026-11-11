// Pending application payload held between form submission and payment confirmation.
// Mirrored to sessionStorage so a page refresh on /payment doesn't lose it.

export type PendingApplication = {
  application_id: string;
  reference: string;
  email: string;
  fullName: string;
};

const STORAGE_KEY = "kenyaEtaPendingApplication";

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

export function setPending(data: PendingApplication) {
  pending = data;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / serialization errors
  }
}

export function getPending(): PendingApplication | null {
  if (pending) return pending;
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
