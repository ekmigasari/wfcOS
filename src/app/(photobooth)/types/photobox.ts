export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PhotoLayout {
  id: string;
  name: string;
  width: number; // Export canvas width (px)
  height: number; // Export canvas height (px)
  slots: Rect[];
  caption: Rect; // Area reserved for the caption text
}

export type FilterOp =
  | { type: "grayscale"; amount: number }
  | { type: "sepia"; amount: number }
  | { type: "saturate"; amount: number }
  | { type: "brightness"; amount: number }
  | { type: "contrast"; amount: number }
  | { type: "hue-rotate"; amount: number };

export interface PhotoFilter {
  id: string;
  name: string;
  ops: FilterOp[];
  tint?: { color: string; alpha: number }; // Soft-light style color wash
  vignette?: number; // 0..1 edge darkening strength
}

export type FramePattern =
  | "none"
  | "dots"
  | "checker"
  | "stripes"
  | "grid"
  | "beans";

export interface FrameStyle {
  id: string;
  name: string;
  background: string;
  pattern: FramePattern;
  patternColor: string;
  textColor: string;
}

export interface CaptionSettings {
  text: string;
  font: string;
  color: string | null; // null = use the frame's text color
  showDate: boolean;
}

export type DecorationType = "emoji" | "icon" | "text";

export interface Decoration {
  id: string;
  type: DecorationType;
  content: string; // Emoji char, icon url, or text
  x: number; // Center X as fraction of frame width (0..1)
  y: number; // Center Y as fraction of frame height (0..1)
  size: number; // Size as fraction of frame width
  rotation: number; // Degrees
  color?: string; // Text only
  font?: string; // Text only
}

export interface GalleryEntry {
  id: string;
  createdAt: number;
  layoutId: string;
  width: number;
  height: number;
}

export interface PhotoboxSettings {
  layoutId: string;
  filterId: string;
  effectId: string; // Face/photo effect baked in at capture ("none" = off)
  frameId: string;
  countdown: number;
  mirror: boolean;
  caption: CaptionSettings;
}
