/**
 * Persists the application form so a client who navigates away (browser Back,
 * accidental refresh, leaving to check a document) finds their details and
 * uploads still in place when they return.
 *
 * Text fields go to sessionStorage (tab-scoped, cleared when the tab closes).
 * Uploaded files go to IndexedDB because they can exceed storage quotas.
 */

const TEXT_KEY = "eta-application-draft";
const DB_NAME = "eta-application";
const STORE = "uploads";

export type DraftText = Record<string, unknown> & { step?: number };

export function saveDraftText(draft: DraftText) {
  try {
    sessionStorage.setItem(TEXT_KEY, JSON.stringify(draft));
  } catch {
    /* quota or privacy mode — persistence is best-effort */
  }
}

export function loadDraftText(): DraftText | null {
  try {
    const raw = sessionStorage.getItem(TEXT_KEY);
    return raw ? (JSON.parse(raw) as DraftText) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(TEXT_KEY);
  } catch {
    /* ignore */
  }
  void deleteAllFiles();
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(key: string, file: File): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* best-effort */
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* best-effort */
  }
}

export async function loadAllFiles(): Promise<Record<string, File>> {
  try {
    const db = await openDb();
    const files = await new Promise<Record<string, File>>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const out: Record<string, File> = {};
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          out[String(cursor.key)] = cursor.value as File;
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return files;
  } catch {
    return {};
  }
}

async function deleteAllFiles(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}
