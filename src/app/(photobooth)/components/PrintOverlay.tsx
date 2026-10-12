"use client";

import { Download, Images, Pencil, RotateCcw } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { Button } from "@/presentation/components/ui/button";
import { fitAspect, useElementSize } from "../hooks/useElementSize";
import { playPrintJingle } from "../utils/sounds";

const PRINT_SECONDS = 3.6;
const PRINTER_HEIGHT = 64;

interface PrintOverlayProps {
  imageUrl: string;
  aspect: number; // width / height of the print
  saveError: string | null;
  onDownload: () => void;
  onEdit: () => void;
  onNewSession: () => void;
  onGallery: () => void;
}

export const PrintOverlay = ({
  imageUrl,
  aspect,
  saveError,
  onDownload,
  onEdit,
  onNewSession,
  onGallery,
}: PrintOverlayProps) => {
  const [done, setDone] = useState(false);
  const [areaRef, areaSize] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    playPrintJingle(PRINT_SECONDS);
    const timer = setTimeout(() => setDone(true), PRINT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, []);

  // Paper hangs below the printer; keep it inside the window
  const paper = fitAspect(
    { width: areaSize.width * 0.8, height: Math.max(0, areaSize.height - 8) },
    aspect
  );
  const printerWidth = Math.max(paper.width + 48, 300);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center gap-3 bg-stone-900/75 p-4 backdrop-blur-sm">
      <div
        className={done ? "" : "pb-rumble"}
        style={{ width: printerWidth, maxWidth: "100%" }}
      >
        <div
          className="relative rounded-xl bg-gradient-to-b from-[#7a4a22] to-[#4a2c12] shadow-2xl"
          style={{ height: PRINTER_HEIGHT }}
        >
          <div className="absolute top-2.5 left-4 flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${
                done ? "bg-lime-400" : "pb-led bg-amber-400"
              } shadow-[0_0_8px_currentColor]`}
            />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#ecdcaf]">
              WFC PHOTOBOX
            </span>
          </div>
          <span className="absolute top-2.5 right-4 text-[10px] font-semibold text-[#ecdcaf]/70">
            {done ? "Ready!" : "Printing…"}
          </span>
          {/* Paper slot */}
          <div className="absolute right-4 bottom-2.5 left-4 h-2 rounded-full bg-black/80 shadow-inner" />
        </div>
      </div>

      <div
        ref={areaRef}
        className="-mt-5 flex min-h-0 w-full flex-1 justify-center overflow-hidden"
      >
        <div
          className="overflow-hidden"
          style={{ width: paper.width, height: paper.height }}
        >
          <div
            className="pb-print-feed h-full w-full bg-white p-0 shadow-xl"
            style={
              { "--pb-print-duration": `${PRINT_SECONDS}s` } as CSSProperties
            }
          >
            <img
              src={imageUrl}
              alt="Your photobox print"
              className="pb-ink h-full w-full object-contain"
              style={
                { "--pb-print-duration": `${PRINT_SECONDS}s` } as CSSProperties
              }
            />
          </div>
        </div>
      </div>

      {/* Space is reserved up front so the paper doesn't resize when actions appear */}
      <div className="flex min-h-[76px] shrink-0 flex-col items-center justify-end">
        {done && (
          <div className="pb-fade-up flex flex-col items-center gap-2">
            {saveError && (
              <p className="rounded bg-red-500/90 px-2 py-1 text-xs text-white">
                {saveError}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                className="bg-accent text-white hover:bg-accent/90"
                onClick={onDownload}
              >
                <Download /> Download JPG
              </Button>
              <Button variant="outline" onClick={onEdit}>
                <Pencil /> Keep editing
              </Button>
              <Button variant="outline" onClick={onGallery}>
                <Images /> Gallery
              </Button>
              <Button variant="outline" onClick={onNewSession}>
                <RotateCcw /> New session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
