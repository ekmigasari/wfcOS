import type { PhotoFilter } from "../types/photobox";

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: "normal", name: "Normal", ops: [] },
  {
    id: "bw",
    name: "B&W",
    ops: [
      { type: "grayscale", amount: 1 },
      { type: "contrast", amount: 1.1 },
    ],
  },
  { id: "sepia", name: "Sepia", ops: [{ type: "sepia", amount: 0.9 }] },
  {
    id: "vintage",
    name: "Vintage",
    ops: [
      { type: "sepia", amount: 0.45 },
      { type: "contrast", amount: 0.9 },
      { type: "brightness", amount: 1.05 },
      { type: "saturate", amount: 0.8 },
    ],
    tint: { color: "#f2c48d", alpha: 0.35 },
    vignette: 0.45,
  },
  {
    id: "warm",
    name: "Warm",
    ops: [
      { type: "saturate", amount: 1.2 },
      { type: "brightness", amount: 1.05 },
    ],
    tint: { color: "#ff9a3c", alpha: 0.3 },
  },
  {
    id: "cool",
    name: "Cool",
    ops: [
      { type: "saturate", amount: 0.9 },
      { type: "hue-rotate", amount: -10 },
    ],
    tint: { color: "#4aa3ff", alpha: 0.3 },
  },
  {
    id: "vivid",
    name: "Vivid",
    ops: [
      { type: "saturate", amount: 1.6 },
      { type: "contrast", amount: 1.15 },
    ],
  },
  {
    id: "fade",
    name: "Fade",
    ops: [
      { type: "contrast", amount: 0.75 },
      { type: "brightness", amount: 1.12 },
      { type: "saturate", amount: 0.7 },
    ],
  },
  {
    id: "noir",
    name: "Noir",
    ops: [
      { type: "grayscale", amount: 1 },
      { type: "contrast", amount: 1.5 },
      { type: "brightness", amount: 0.9 },
    ],
    vignette: 0.6,
  },
  {
    id: "retro-pink",
    name: "Retro Pink",
    ops: [
      { type: "saturate", amount: 1.1 },
      { type: "contrast", amount: 0.95 },
    ],
    tint: { color: "#ff6fa8", alpha: 0.4 },
    vignette: 0.25,
  },
];

export const DEFAULT_FILTER_ID = "normal";

export const getFilter = (id: string): PhotoFilter =>
  PHOTO_FILTERS.find((filter) => filter.id === id) ?? PHOTO_FILTERS[0];

// CSS equivalent of the filter ops, used for the live camera preview
export const filterToCss = (filter: PhotoFilter): string =>
  filter.ops.length === 0
    ? "none"
    : filter.ops
        .map((op) =>
          op.type === "hue-rotate"
            ? `hue-rotate(${op.amount}deg)`
            : `${op.type}(${op.amount})`
        )
        .join(" ");

export const vignetteToCss = (strength: number): string =>
  `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`;
