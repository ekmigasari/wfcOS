import type { PhotoLayout, Rect } from "../types/photobox";

interface GridOptions {
  id: string;
  name: string;
  cols: number;
  rows: number;
  slotW: number;
  slotH: number;
  pad?: number;
  gap?: number;
  captionH?: number;
}

// Builds a uniform grid layout with a caption band at the bottom
const buildGrid = ({
  id,
  name,
  cols,
  rows,
  slotW,
  slotH,
  pad = 40,
  gap = 24,
  captionH = 160,
}: GridOptions): PhotoLayout => {
  const slots: Rect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x: pad + c * (slotW + gap),
        y: pad + r * (slotH + gap),
        w: slotW,
        h: slotH,
      });
    }
  }
  const width = pad * 2 + cols * slotW + (cols - 1) * gap;
  const gridBottom = pad + rows * slotH + (rows - 1) * gap;
  return {
    id,
    name,
    width,
    height: gridBottom + captionH,
    slots,
    caption: { x: pad, y: gridBottom, w: width - pad * 2, h: captionH },
  };
};

export const PHOTO_LAYOUTS: PhotoLayout[] = [
  buildGrid({
    id: "strip-3",
    name: "Strip 3",
    cols: 1,
    rows: 3,
    slotW: 520,
    slotH: 390,
    captionH: 180,
  }),
  buildGrid({
    id: "strip-4",
    name: "Strip 4",
    cols: 1,
    rows: 4,
    slotW: 520,
    slotH: 390,
    captionH: 180,
  }),
  buildGrid({
    id: "strip-2",
    name: "Strip 2",
    cols: 1,
    rows: 2,
    slotW: 520,
    slotH: 390,
    captionH: 180,
  }),
  buildGrid({
    id: "grid-2x2",
    name: "Grid 2×2",
    cols: 2,
    rows: 2,
    slotW: 480,
    slotH: 360,
  }),
  buildGrid({
    id: "grid-2x3",
    name: "Grid 2×3",
    cols: 2,
    rows: 3,
    slotW: 480,
    slotH: 360,
  }),
  buildGrid({
    id: "polaroid",
    name: "Polaroid",
    cols: 1,
    rows: 1,
    slotW: 800,
    slotH: 800,
    pad: 50,
    captionH: 260,
  }),
  {
    id: "big-two-small",
    name: "1 Big + 2",
    width: 1000,
    height: 40 + 520 + 24 + 336 + 160,
    slots: [
      { x: 40, y: 40, w: 920, h: 520 },
      { x: 40, y: 584, w: 448, h: 336 },
      { x: 512, y: 584, w: 448, h: 336 },
    ],
    caption: { x: 40, y: 920, w: 920, h: 160 },
  },
  buildGrid({
    id: "wide-3",
    name: "Wide 3",
    cols: 3,
    rows: 1,
    slotW: 480,
    slotH: 360,
    captionH: 140,
  }),
];

export const DEFAULT_LAYOUT_ID = "strip-3";

export const getLayout = (id: string): PhotoLayout =>
  PHOTO_LAYOUTS.find((layout) => layout.id === id) ?? PHOTO_LAYOUTS[0];
