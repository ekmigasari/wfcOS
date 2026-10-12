"use client";

import type { CSSProperties } from "react";
import { cn } from "@/infrastructure/lib/utils";
import { FRAME_STYLES } from "../constants/frames";
import type { FrameStyle } from "../types/photobox";

// CSS approximation of the canvas patterns, for the small swatches only
const swatchStyle = (frame: FrameStyle): CSSProperties => {
  const c = frame.patternColor;
  switch (frame.pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(${c} 22%, transparent 24%)`,
        backgroundSize: "10px 10px",
      };
    case "checker":
      return {
        backgroundImage: `conic-gradient(${c} 25%, transparent 0 50%, ${c} 0 75%, transparent 0)`,
        backgroundSize: "12px 12px",
      };
    case "stripes":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${c} 0 4px, transparent 4px 10px)`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        backgroundSize: "8px 8px",
      };
    case "beans":
      return {
        backgroundImage: `radial-gradient(ellipse 4px 3px, ${c} 90%, transparent 100%)`,
        backgroundSize: "14px 14px",
      };
    default:
      return {};
  }
};

interface FramePanelProps {
  value: string;
  onChange: (frameId: string) => void;
}

export const FramePanel = ({ value, onChange }: FramePanelProps) => (
  <div className="grid grid-cols-3 gap-2">
    {FRAME_STYLES.map((frame) => (
      <button
        key={frame.id}
        type="button"
        onClick={() => onChange(frame.id)}
        className={cn(
          "flex flex-col items-center gap-1 rounded-md border-2 p-1 transition",
          value === frame.id
            ? "border-accent bg-accent/10"
            : "border-transparent hover:bg-black/5"
        )}
      >
        <div
          className="flex h-10 w-full items-end justify-center rounded ring-1 ring-black/10"
          style={{ backgroundColor: frame.background, ...swatchStyle(frame) }}
        >
          <span
            className="mb-0.5 text-[9px] font-bold"
            style={{ color: frame.textColor }}
          >
            Aa
          </span>
        </div>
        <span className="text-[10px] font-medium text-primary">
          {frame.name}
        </span>
      </button>
    ))}
  </div>
);
