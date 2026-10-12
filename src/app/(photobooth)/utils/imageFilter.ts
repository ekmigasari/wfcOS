import type { FilterOp, PhotoFilter } from "../types/photobox";

type Matrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

// Color matrices from the CSS Filter Effects spec, so canvas output matches the live CSS preview
const grayscaleMatrix = (amount: number): Matrix3 => {
  const s = 1 - Math.min(1, amount);
  return [
    0.2126 + 0.7874 * s,
    0.7152 - 0.7152 * s,
    0.0722 - 0.0722 * s,
    0.2126 - 0.2126 * s,
    0.7152 + 0.2848 * s,
    0.0722 - 0.0722 * s,
    0.2126 - 0.2126 * s,
    0.7152 - 0.7152 * s,
    0.0722 + 0.9278 * s,
  ];
};

const sepiaMatrix = (amount: number): Matrix3 => {
  const s = 1 - Math.min(1, amount);
  return [
    0.393 + 0.607 * s,
    0.769 - 0.769 * s,
    0.189 - 0.189 * s,
    0.349 - 0.349 * s,
    0.686 + 0.314 * s,
    0.168 - 0.168 * s,
    0.272 - 0.272 * s,
    0.534 - 0.534 * s,
    0.131 + 0.869 * s,
  ];
};

const saturateMatrix = (s: number): Matrix3 => [
  0.213 + 0.787 * s,
  0.715 - 0.715 * s,
  0.072 - 0.072 * s,
  0.213 - 0.213 * s,
  0.715 + 0.285 * s,
  0.072 - 0.072 * s,
  0.213 - 0.213 * s,
  0.715 - 0.715 * s,
  0.072 + 0.928 * s,
];

const hueRotateMatrix = (degrees: number): Matrix3 => {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    0.213 + cos * 0.787 - sin * 0.213,
    0.715 - cos * 0.715 - sin * 0.715,
    0.072 - cos * 0.072 + sin * 0.928,
    0.213 - cos * 0.213 + sin * 0.143,
    0.715 + cos * 0.285 + sin * 0.14,
    0.072 - cos * 0.072 - sin * 0.283,
    0.213 - cos * 0.213 - sin * 0.787,
    0.715 - cos * 0.715 + sin * 0.715,
    0.072 + cos * 0.928 + sin * 0.072,
  ];
};

const applyMatrix = (data: Uint8ClampedArray, m: Matrix3) => {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = m[0] * r + m[1] * g + m[2] * b;
    data[i + 1] = m[3] * r + m[4] * g + m[5] * b;
    data[i + 2] = m[6] * r + m[7] * g + m[8] * b;
  }
};

const applyLinear = (
  data: Uint8ClampedArray,
  slope: number,
  intercept: number
) => {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * slope + intercept;
    data[i + 1] = data[i + 1] * slope + intercept;
    data[i + 2] = data[i + 2] * slope + intercept;
  }
};

const applyOp = (data: Uint8ClampedArray, op: FilterOp) => {
  switch (op.type) {
    case "grayscale":
      return applyMatrix(data, grayscaleMatrix(op.amount));
    case "sepia":
      return applyMatrix(data, sepiaMatrix(op.amount));
    case "saturate":
      return applyMatrix(data, saturateMatrix(op.amount));
    case "hue-rotate":
      return applyMatrix(data, hueRotateMatrix(op.amount));
    case "brightness":
      return applyLinear(data, op.amount, 0);
    case "contrast":
      return applyLinear(data, op.amount, 127.5 * (1 - op.amount));
  }
};

/**
 * Applies a photo filter in place to a canvas. Uses pixel math instead of
 * ctx.filter because Safari does not support canvas filters.
 */
export const applyFilterToCanvas = (
  canvas: HTMLCanvasElement,
  filter: PhotoFilter
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  if (filter.ops.length > 0) {
    const imageData = ctx.getImageData(0, 0, width, height);
    for (const op of filter.ops) {
      applyOp(imageData.data, op);
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (filter.tint) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = filter.tint.alpha;
    ctx.fillStyle = filter.tint.color;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filter.vignette) {
    const radius = Math.hypot(width, height) / 2;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.55,
      width / 2,
      height / 2,
      radius
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${filter.vignette})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
};
