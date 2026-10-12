"use client";

import { cn } from "@/infrastructure/lib/utils";
import { PHOTO_LAYOUTS } from "../constants/layouts";

interface LayoutPickerProps {
  value: string;
  disabled?: boolean;
  onChange: (layoutId: string) => void;
  className?: string;
}

const THUMB_HEIGHT = 36;

export const LayoutPicker = ({
  value,
  disabled,
  onChange,
  className,
}: LayoutPickerProps) => (
  <div className={cn("flex flex-wrap gap-1", className)}>
    {PHOTO_LAYOUTS.map((layout) => {
      const scale = THUMB_HEIGHT / layout.height;
      const width = Math.max(22, layout.width * scale);
      return (
        <button
          key={layout.id}
          type="button"
          disabled={disabled}
          title={layout.name}
          onClick={() => onChange(layout.id)}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-md border-2 p-1.5 transition disabled:opacity-50",
            value === layout.id
              ? "border-accent bg-accent/10"
              : "border-transparent hover:bg-black/5"
          )}
        >
          <div
            className="relative rounded-sm bg-white shadow-sm ring-1 ring-black/10"
            style={{ width, height: THUMB_HEIGHT }}
          >
            {layout.slots.map((slot, i) => (
              <div
                key={i}
                className="absolute rounded-[1px] bg-secondary/60"
                style={{
                  left: `${(slot.x / layout.width) * 100}%`,
                  top: `${(slot.y / layout.height) * 100}%`,
                  width: `${(slot.w / layout.width) * 100}%`,
                  height: `${(slot.h / layout.height) * 100}%`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-primary">
            {layout.name}
          </span>
        </button>
      );
    })}
  </div>
);
