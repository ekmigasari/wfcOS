"use client";

import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/infrastructure/lib/utils";
import { filterToCss } from "../constants/filters";
import type { PhotoFilter, PhotoLayout } from "../types/photobox";
import { FilterOverlay } from "./FilterOverlay";

interface SlotTrayProps {
  layout: PhotoLayout;
  photos: (string | null)[];
  filter: PhotoFilter;
  selectedSlot: number | null;
  activeSlot: number | null;
  disabled: boolean;
  canShoot: boolean;
  onSelect: (index: number) => void;
  onRetake: (index: number) => void;
  onUpload: (index: number) => void;
  onClear: (index: number) => void;
}

export const SlotTray = ({
  layout,
  photos,
  filter,
  selectedSlot,
  activeSlot,
  disabled,
  canShoot,
  onSelect,
  onRetake,
  onUpload,
  onClear,
}: SlotTrayProps) => (
  <div className="grid grid-cols-3 gap-2 @3xl:grid-cols-2">
    {layout.slots.map((slot, index) => {
      const photo = photos[index];
      const isActive = activeSlot === index;
      return (
        <div
          key={index}
          className={cn(
            "group relative overflow-hidden rounded-md border-2 bg-stone-200",
            isActive
              ? "border-red-500"
              : selectedSlot === index
                ? "border-accent"
                : "border-transparent"
          )}
          style={{ aspectRatio: `${slot.w} / ${slot.h}` }}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(index)}
            className="absolute inset-0 h-full w-full"
            title={`Slot ${index + 1}`}
          >
            {photo ? (
              <>
                <img
                  key={photo.slice(-24)}
                  src={photo}
                  alt={`Shot ${index + 1}`}
                  className="pb-thumb-in h-full w-full object-cover"
                  style={{ filter: filterToCss(filter) }}
                />
                <FilterOverlay filter={filter} />
              </>
            ) : (
              <span className="flex h-full items-center justify-center text-lg font-bold text-stone-400">
                {index + 1}
              </span>
            )}
          </button>

          {isActive && (
            <span className="absolute top-1 left-1 flex items-center gap-1 rounded bg-red-500 px-1.5 text-[10px] font-bold text-white">
              <span className="pb-led size-1.5 rounded-full bg-white" /> REC
            </span>
          )}

          {!disabled && (
            <div className="absolute right-1 bottom-1 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              {canShoot && (
                <button
                  type="button"
                  title="Retake this shot"
                  onClick={() => onRetake(index)}
                  className="rounded bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <Camera className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                title="Upload a photo for this slot"
                onClick={() => onUpload(index)}
                className="rounded bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <Upload className="size-3.5" />
              </button>
              {photo && (
                <button
                  type="button"
                  title="Clear this slot"
                  onClick={() => onClear(index)}
                  className="rounded bg-black/60 p-1 text-white hover:bg-red-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
);
