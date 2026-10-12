"use client";

import { cn } from "@/infrastructure/lib/utils";
import { filterToCss, PHOTO_FILTERS } from "../constants/filters";
import { FilterOverlay } from "./FilterOverlay";

interface FilterPickerProps {
  value: string;
  samplePhoto: string | null;
  onChange: (filterId: string) => void;
  className?: string;
}

// Fallback swatch when there is no photo yet
const SAMPLE_GRADIENT =
  "linear-gradient(135deg, #f4a261 0%, #e76f51 35%, #2a9d8f 70%, #264653 100%)";

export const FilterPicker = ({
  value,
  samplePhoto,
  onChange,
  className,
}: FilterPickerProps) => (
  <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
    {PHOTO_FILTERS.map((filter) => (
      <button
        key={filter.id}
        type="button"
        onClick={() => onChange(filter.id)}
        className={cn(
          "flex shrink-0 flex-col items-center gap-1 rounded-md border-2 p-1 transition",
          value === filter.id
            ? "border-accent bg-accent/10"
            : "border-transparent hover:bg-black/5"
        )}
      >
        <div className="relative size-12 overflow-hidden rounded">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: samplePhoto
                ? `url(${samplePhoto})`
                : SAMPLE_GRADIENT,
              filter: filterToCss(filter),
            }}
          />
          <FilterOverlay filter={filter} />
        </div>
        <span className="text-[10px] font-medium text-primary">
          {filter.name}
        </span>
      </button>
    ))}
  </div>
);
