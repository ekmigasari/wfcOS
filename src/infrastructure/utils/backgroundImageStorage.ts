"use client";

import {
  CUSTOM_BACKGROUND_STORAGE_KEY,
  CUSTOM_BACKGROUND_URL,
} from "@/application/atoms/backgroundAtom";

const DATABASE_NAME = "wfcOS-assets";
const STORE_NAME = "backgrounds";

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

const readBlob = async (): Promise<Blob | null> => {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null;
  }

  const db = await openDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(CUSTOM_BACKGROUND_STORAGE_KEY);

    request.onsuccess = () =>
      resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
};

export const saveUploadedBackground = async (
  dataUrl: string
): Promise<string> => {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return dataUrl;
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, CUSTOM_BACKGROUND_STORAGE_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });

  return CUSTOM_BACKGROUND_URL;
};

export const getUploadedBackgroundObjectUrl = async (): Promise<
  string | null
> => {
  const blob = await readBlob();
  return blob ? URL.createObjectURL(blob) : null;
};
