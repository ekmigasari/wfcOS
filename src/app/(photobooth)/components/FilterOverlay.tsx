import { vignetteToCss } from "../constants/filters";
import type { PhotoFilter } from "../types/photobox";

// Tint + vignette layers drawn over a filtered image/video (mirrors applyFilterToCanvas)
export const FilterOverlay = ({ filter }: { filter: PhotoFilter }) => (
  <>
    {filter.tint && (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: filter.tint.color,
          opacity: filter.tint.alpha,
          mixBlendMode: "soft-light",
        }}
      />
    )}
    {filter.vignette && (
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: vignetteToCss(filter.vignette) }}
      />
    )}
  </>
);
