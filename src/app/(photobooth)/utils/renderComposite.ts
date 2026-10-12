import { EMOJI_FONT_STACK, getFontCss } from "../constants/stickers";
import type {
  CaptionSettings,
  Decoration,
  FrameStyle,
  PhotoFilter,
  PhotoLayout,
  Rect,
} from "../types/photobox";
import { applyFilterToCanvas } from "./imageFilter";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      imageCache.delete(src);
      reject(new Error(`Failed to load image: ${src.slice(0, 64)}`));
    };
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
};

// Session photos are large data URLs; drop them from the cache once replaced
export const forgetImage = (src: string) => {
  imageCache.delete(src);
};

export const formatCaptionDate = (date = new Date()) =>
  date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const drawPattern = (
  ctx: CanvasRenderingContext2D,
  frame: FrameStyle,
  width: number,
  height: number
) => {
  ctx.save();
  ctx.fillStyle = frame.patternColor;
  ctx.strokeStyle = frame.patternColor;

  switch (frame.pattern) {
    case "dots": {
      const gap = 48;
      for (let y = 0, row = 0; y < height + gap; y += gap, row++) {
        for (let x = row % 2 ? gap / 2 : 0; x < width + gap; x += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "checker": {
      const size = 40;
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          if ((x / size + y / size) % 2 === 0) ctx.fillRect(x, y, size, size);
        }
      }
      break;
    }
    case "stripes": {
      ctx.lineWidth = 22;
      for (let x = -height; x < width + height; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      break;
    }
    case "grid": {
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    }
    case "beans": {
      const gap = 90;
      for (let y = 20, row = 0; y < height + gap; y += gap, row++) {
        for (let x = row % 2 ? gap / 2 : 0; x < width + gap; x += gap) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(((row * 37 + x) % 180) * (Math.PI / 180));
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = frame.background;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-14, 0);
          ctx.quadraticCurveTo(0, -6, 14, 0);
          ctx.stroke();
          ctx.restore();
        }
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
};

const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  { x, y, w, h }: Rect,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

// Draws a photo into a slot with "object-fit: cover" cropping and the filter applied
const drawPhoto = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: Rect,
  filter: PhotoFilter,
  scale: number
) => {
  const w = Math.max(1, Math.round(slot.w * scale));
  const h = Math.max(1, Math.round(slot.h * scale));
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const octx = offscreen.getContext("2d");
  if (!octx) return;

  const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * ratio;
  const dh = img.naturalHeight * ratio;
  octx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  applyFilterToCanvas(offscreen, filter);

  ctx.save();
  roundedRectPath(ctx, slot, 6);
  ctx.clip();
  ctx.drawImage(offscreen, slot.x, slot.y, slot.w, slot.h);
  ctx.restore();
};

const drawPlaceholder = (
  ctx: CanvasRenderingContext2D,
  slot: Rect,
  index: number
) => {
  ctx.save();
  roundedRectPath(ctx, slot, 6);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fill();
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.font = `bold ${Math.round(slot.h * 0.18)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${index + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
  ctx.restore();
};

const drawCaption = (
  ctx: CanvasRenderingContext2D,
  caption: CaptionSettings,
  area: Rect,
  color: string
) => {
  const date = caption.showDate ? formatCaptionDate() : "";
  const text = caption.text.trim();
  if (!text && !date) return;

  const font = getFontCss(caption.font);
  const textSize = Math.min(area.h * 0.34, area.w * 0.09);
  const dateSize = Math.min(area.h * 0.16, area.w * 0.05);
  const cx = area.x + area.w / 2;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (text && date) {
    ctx.font = `bold ${textSize}px ${font}`;
    ctx.fillText(text, cx, area.y + area.h * 0.42, area.w);
    ctx.font = `${dateSize}px ${font}`;
    ctx.fillText(date, cx, area.y + area.h * 0.74, area.w);
  } else if (text) {
    ctx.font = `bold ${textSize}px ${font}`;
    ctx.fillText(text, cx, area.y + area.h / 2, area.w);
  } else {
    ctx.font = `${dateSize * 1.3}px ${font}`;
    ctx.fillText(date, cx, area.y + area.h / 2, area.w);
  }
  ctx.restore();
};

export const TEXT_LINE_HEIGHT = 1.15;

const drawDecoration = async (
  ctx: CanvasRenderingContext2D,
  item: Decoration,
  width: number,
  height: number
) => {
  const size = item.size * width;
  ctx.save();
  ctx.translate(item.x * width, item.y * height);
  ctx.rotate((item.rotation * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (item.type === "emoji") {
    ctx.font = `${size}px ${EMOJI_FONT_STACK}`;
    ctx.fillText(item.content, 0, 0);
  } else if (item.type === "icon") {
    try {
      const img = await loadImage(item.content);
      const h = size * (img.naturalHeight / img.naturalWidth);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, -size / 2, -h / 2, size, h);
    } catch (error) {
      console.error(error);
    }
  } else {
    const lines = item.content.split("\n");
    const lineHeight = size * TEXT_LINE_HEIGHT;
    ctx.font = `bold ${size}px ${getFontCss(item.font)}`;
    ctx.fillStyle = item.color ?? "#000000";
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineHeight);
    });
  }
  ctx.restore();
};

export interface RenderOptions {
  layout: PhotoLayout;
  photos: (string | null)[];
  filter: PhotoFilter;
  frame: FrameStyle;
  caption: CaptionSettings;
  decorations?: Decoration[];
  scale?: number;
  showPlaceholders?: boolean;
}

export const renderComposite = async ({
  layout,
  photos,
  filter,
  frame,
  caption,
  decorations = [],
  scale = 1,
  showPlaceholders = false,
}: RenderOptions): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(layout.width * scale);
  canvas.height = Math.round(layout.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const images = await Promise.all(
    layout.slots.map((_, i) => {
      const src = photos[i];
      return src ? loadImage(src).catch(() => null) : Promise.resolve(null);
    })
  );

  ctx.scale(scale, scale);
  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, layout.width, layout.height);
  drawPattern(ctx, frame, layout.width, layout.height);

  layout.slots.forEach((slot, i) => {
    const img = images[i];
    if (img) drawPhoto(ctx, img, slot, filter, scale);
    else if (showPlaceholders) drawPlaceholder(ctx, slot, i);
    else {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    }
  });

  drawCaption(ctx, caption, layout.caption, caption.color ?? frame.textColor);

  for (const item of decorations) {
    await drawDecoration(ctx, item, layout.width, layout.height);
  }

  return canvas;
};

export const canvasToJpegBlob = (canvas: HTMLCanvasElement, quality = 0.92) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/jpeg",
      quality
    );
  });

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const buildFilename = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `wfc-photobox-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.jpg`;
};

const MAX_PHOTO_WIDTH = 1280;

// Grabs the current video frame as a JPEG data URL (mirrored if the preview is mirrored)
export const captureVideoFrame = (
  video: HTMLVideoElement,
  mirror: boolean
): string | null => {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight) return null;
  const ratio = Math.min(1, MAX_PHOTO_WIDTH / videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(videoWidth * ratio);
  canvas.height = Math.round(videoHeight * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
};

// Reads an uploaded image file and downsizes it to keep memory usage reasonable
export const fileToPhoto = async (file: File): Promise<string> => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unsupported image file"));
      image.src = objectUrl;
    });
    const ratio = Math.min(
      1,
      1600 / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
