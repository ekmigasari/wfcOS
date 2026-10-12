"use client";

import { useAtom } from "jotai";
import { Download, ImageOff, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { photoboxGalleryAtom } from "@/application/atoms/photoboxAtom";
import {
  deletePhotoboxPrint,
  getPhotoboxPrint,
} from "@/infrastructure/utils/photoboxStorage";
import { Button } from "@/presentation/components/ui/button";
import type { GalleryEntry } from "../types/photobox";
import { buildFilename, downloadBlob } from "../utils/renderComposite";

interface LoadedPrint {
  blob: Blob;
  url: string;
}

export const GalleryView = () => {
  const [entries, setEntries] = useAtom(photoboxGalleryAtom);
  const [prints, setPrints] = useState<Record<string, LoadedPrint | null>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load blobs for entries we haven't loaded yet; null marks a missing blob
  useEffect(() => {
    const missing = entries.filter((entry) => !(entry.id in prints));
    if (missing.length === 0) return;
    let cancelled = false;

    void Promise.all(
      missing.map(async (entry) => {
        try {
          const blob = await getPhotoboxPrint(entry.id);
          return [
            entry.id,
            blob ? { blob, url: URL.createObjectURL(blob) } : null,
          ] as const;
        } catch {
          return [entry.id, null] as const;
        }
      })
    ).then((loaded) => {
      if (cancelled) {
        loaded.forEach(([, print]) => print && URL.revokeObjectURL(print.url));
        return;
      }
      setPrints((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
    });

    return () => {
      cancelled = true;
    };
  }, [entries, prints]);

  // Revoke object URLs when the gallery closes
  const printsRef = useRef(prints);
  printsRef.current = prints;
  useEffect(
    () => () => {
      Object.values(printsRef.current).forEach(
        (print) => print && URL.revokeObjectURL(print.url)
      );
    },
    []
  );

  const handleDelete = async (entry: GalleryEntry) => {
    try {
      await deletePhotoboxPrint(entry.id);
    } catch (error) {
      console.error("Failed to delete photobox print", error);
    }
    const print = prints[entry.id];
    if (print) URL.revokeObjectURL(print.url);
    setPrints((prev) => {
      const next = { ...prev };
      delete next[entry.id];
      return next;
    });
    setEntries((prev) => prev.filter((item) => item.id !== entry.id));
    setConfirmDeleteId(null);
    setOpenId(null);
  };

  const handleDownload = (entry: GalleryEntry) => {
    const print = prints[entry.id];
    if (print)
      downloadBlob(print.blob, buildFilename(new Date(entry.createdAt)));
  };

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-stone-500">
        <span className="text-4xl">📸</span>
        <p className="text-sm">
          No prints yet. Take some photos and hit Print!
        </p>
      </div>
    );
  }

  const openEntry = entries.find((entry) => entry.id === openId) ?? null;
  const openPrint = openEntry ? prints[openEntry.id] : null;

  return (
    <div className="relative h-full min-h-0">
      <div className="grid h-full grid-cols-[repeat(auto-fill,minmax(120px,1fr))] content-start gap-3 overflow-y-auto pr-1">
        {entries.map((entry) => {
          const print = prints[entry.id];
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setOpenId(entry.id)}
              className="group flex flex-col items-center gap-1 rounded-md p-2 transition hover:bg-black/5"
            >
              <div className="flex h-36 w-full items-center justify-center">
                {print ? (
                  <img
                    src={print.url}
                    alt="Photobox print"
                    className="max-h-full max-w-full shadow-md transition group-hover:-rotate-2 group-hover:scale-105"
                  />
                ) : print === null ? (
                  <ImageOff className="size-8 text-stone-400" />
                ) : (
                  <div className="h-full w-20 animate-pulse rounded bg-stone-200" />
                )}
              </div>
              <span className="text-[10px] text-stone-500">
                {new Date(entry.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </button>
          );
        })}
      </div>

      {openEntry && (
        <div className="absolute inset-0 z-10 flex flex-col gap-3 bg-stone-50/95 p-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {new Date(openEntry.createdAt).toLocaleString()}
            </span>
            <Button size="icon" variant="ghost" onClick={() => setOpenId(null)}>
              <X />
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {openPrint ? (
              <img
                src={openPrint.url}
                alt="Photobox print"
                className="max-h-full max-w-full shadow-xl"
              />
            ) : (
              <p className="text-sm text-stone-500">
                This print's image is missing from browser storage.
              </p>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <Button
              className="bg-accent text-white hover:bg-accent/90"
              disabled={!openPrint}
              onClick={() => handleDownload(openEntry)}
            >
              <Download /> Download JPG
            </Button>
            {confirmDeleteId === openEntry.id ? (
              <Button
                variant="destructive"
                onClick={() => void handleDelete(openEntry)}
              >
                <Trash2 /> Confirm delete
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(openEntry.id)}
              >
                <Trash2 /> Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
