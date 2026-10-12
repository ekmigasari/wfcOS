import type { FrameStyle } from "../types/photobox";

export const FRAME_STYLES: FrameStyle[] = [
  {
    id: "cream",
    name: "Cream",
    background: "#f5ecd7",
    pattern: "none",
    patternColor: "#000000",
    textColor: "#2f2010",
  },
  {
    id: "white",
    name: "White",
    background: "#ffffff",
    pattern: "none",
    patternColor: "#000000",
    textColor: "#222222",
  },
  {
    id: "black",
    name: "Black",
    background: "#151515",
    pattern: "none",
    patternColor: "#ffffff",
    textColor: "#f5f5f5",
  },
  {
    id: "espresso",
    name: "Espresso",
    background: "#2f2010",
    pattern: "none",
    patternColor: "#ffffff",
    textColor: "#ecdcaf",
  },
  {
    id: "pink",
    name: "Pink",
    background: "#ffc8dd",
    pattern: "none",
    patternColor: "#ffffff",
    textColor: "#8a1c4a",
  },
  {
    id: "sky",
    name: "Sky",
    background: "#bde0fe",
    pattern: "none",
    patternColor: "#ffffff",
    textColor: "#1d3557",
  },
  {
    id: "polka",
    name: "Polka",
    background: "#ffe5a0",
    pattern: "dots",
    patternColor: "#ffffff",
    textColor: "#6f4018",
  },
  {
    id: "checker",
    name: "Checker",
    background: "#ffffff",
    pattern: "checker",
    patternColor: "#e9d5ff",
    textColor: "#5b21b6",
  },
  {
    id: "candy",
    name: "Candy",
    background: "#ffd6e7",
    pattern: "stripes",
    patternColor: "#ffffff",
    textColor: "#be185d",
  },
  {
    id: "notebook",
    name: "Notebook",
    background: "#fdfdf8",
    pattern: "grid",
    patternColor: "#b9d7f0",
    textColor: "#1e3a8a",
  },
  {
    id: "beans",
    name: "Coffee Beans",
    background: "#a65330",
    pattern: "beans",
    patternColor: "#6f4018",
    textColor: "#fff4dc",
  },
];

export const DEFAULT_FRAME_ID = "cream";

export const getFrame = (id: string): FrameStyle =>
  FRAME_STYLES.find((frame) => frame.id === id) ?? FRAME_STYLES[0];
