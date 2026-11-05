/** Saved looks live in the browser's IndexedDB (photos are too big for localStorage). */

export interface SavedLook {
  id: string;
  createdAt: number;
  image: string; // data URL (jpeg)
  garments: string[];
}

const DB = "tryme-ai";
const STORE = "looks";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLook(look: Omit<SavedLook, "id" | "createdAt">): Promise<SavedLook> {
  const full: SavedLook = {
    ...look,
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    createdAt: Date.now(),
  };
  await tx("readwrite", (s) => s.put(full));
  return full;
}

export async function listLooks(): Promise<SavedLook[]> {
  const all = await tx<SavedLook[]>("readonly", (s) => s.getAll() as IDBRequest<SavedLook[]>);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteLook(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
