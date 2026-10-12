"use client";

import { CameraOff, Loader2, RefreshCw, Upload } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/presentation/components/ui/button";
import { filterToCss } from "../constants/filters";
import type { TrackerStatus } from "../effects/faceTracker";
import type { CameraStatus } from "../hooks/useCamera";
import type { PhotoFilter } from "../types/photobox";
import { FilterOverlay } from "./FilterOverlay";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  filter: PhotoFilter;
  mirror: boolean;
  countdown: number | null;
  flashKey: number;
  shotLabel: string | null;
  onRetry: () => void;
  onUpload: () => void;
  effectCanvasRef: RefObject<HTMLCanvasElement | null>;
  effectActive: boolean;
  needsFace: boolean;
  trackerStatus: TrackerStatus;
  faceCount: number;
}

const STATUS_MESSAGES: Partial<Record<CameraStatus, string>> = {
  denied:
    "Camera permission was blocked. Allow camera access in your browser, or upload photos instead.",
  unavailable: "No camera found. You can upload photos instead.",
  error: "Could not start the camera. It may be in use by another app.",
};

export const CameraView = ({
  videoRef,
  status,
  filter,
  mirror,
  countdown,
  flashKey,
  shotLabel,
  onRetry,
  onUpload,
  effectCanvasRef,
  effectActive,
  needsFace,
  trackerStatus,
  faceCount,
}: CameraViewProps) => {
  const message = STATUS_MESSAGES[status];
  const ready = status === "ready";
  const trackerHint =
    !ready || !needsFace
      ? null
      : trackerStatus === "loading"
        ? "Loading face magic…"
        : trackerStatus === "error"
          ? "Face effects need internet the first time. Try again online."
          : trackerStatus === "ready" && faceCount === 0
            ? "Look at the camera 👀"
            : null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: filterToCss(filter),
          transform: mirror ? "scaleX(-1)" : undefined,
          opacity: ready && !effectActive ? 1 : 0,
        }}
      />
      {/* Effect frames are drawn here already mirrored; this canvas is what gets captured */}
      <canvas
        ref={effectCanvasRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: filterToCss(filter),
          display: ready && effectActive ? "block" : "none",
        }}
      />
      {status === "ready" && <FilterOverlay filter={filter} />}

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-200">
          <Loader2 className="size-8 animate-spin" />
          <span className="text-sm">Starting camera…</span>
        </div>
      )}

      {message && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-stone-200">
          <CameraOff className="size-10 opacity-70" />
          <p className="max-w-xs text-sm">{message}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="text-white"
              onClick={onRetry}
            >
              <RefreshCw /> Retry
            </Button>
            <Button
              size="sm"
              className="bg-accent text-white hover:bg-accent/90"
              onClick={onUpload}
            >
              <Upload /> Upload
            </Button>
          </div>
        </div>
      )}

      {trackerHint && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium whitespace-nowrap text-white">
          {trackerHint}
        </div>
      )}

      {shotLabel && (
        <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
          {shotLabel}
        </div>
      )}

      {countdown !== null && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            key={`${shotLabel}-${countdown}`}
            className="pb-count text-[7rem] leading-none font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            {countdown}
          </span>
        </div>
      )}

      {flashKey > 0 && (
        <div
          key={flashKey}
          className="pb-flash pointer-events-none absolute inset-0 bg-white"
        />
      )}
    </div>
  );
};
