"use client";

// Photobox prints are stored as JPEG blobs in their own IndexedDB database.
// A separate database is used because wfcOS-assets is opened at a fixed version.
const DATABASE_NAME = "wfcOS-photobox";
const STORE_NAME = "prints";

const isSupported = () =>
  typeof window !== "undefined" && "indexedDB" in window;

const openDatabase = async (): Promise<IDBDatabase> => {
  return await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const runRequest = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
  const db = await openDatabase();

  return await new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
};

export const savePhotoboxPrint = async (id: string, blob: Blob) => {
  if (!isSupported()) throw new Error("IndexedDB is not available");
  await runRequest<IDBValidKey>("readwrite", (store) => store.put(blob, id));
};

export const getPhotoboxPrint = async (id: string): Promise<Blob | null> => {
  if (!isSupported()) return null;
  const blob = await runRequest<Blob | undefined>("readonly", (store) =>
    store.get(id)
  );
  return blob ?? null;
};

export const deletePhotoboxPrint = async (id: string) => {
  if (!isSupported()) return;
  await runRequest<undefined>("readwrite", (store) => store.delete(id));
};
