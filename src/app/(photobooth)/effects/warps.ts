import type { FaceGeometry } from "./faceGeometry";
import type { Point } from "./faceTracker";

/**
 * Maps a destination point inside a unit ellipse (nx, ny, with r = radius
 * 0..1) to the source point it should sample from, in the same units.
 */
type WarpMapping = (nx: number, ny: number, r: number) => [number, number];

/**
 * Applies a warp inside an ellipse (rotated with the head). Pixels are
 * resampled bilinearly from a copy of the region, so warps can be chained.
 */
const warpRegion = (
  ctx: CanvasRenderingContext2D,
  center: Point,
  rx: number,
  ry: number,
  angle: number,
  mapping: WarpMapping
) => {
  const { width, height } = ctx.canvas;
  const reach = Math.max(rx, ry);
  const x0 = Math.max(0, Math.floor(center.x - reach));
  const y0 = Math.max(0, Math.floor(center.y - reach));
  const x1 = Math.min(width, Math.ceil(center.x + reach));
  const y1 = Math.min(height, Math.ceil(center.y + reach));
  const w = x1 - x0;
  const h = y1 - y0;
  if (w <= 1 || h <= 1) return;

  const image = ctx.getImageData(x0, y0, w, h);
  const src = new Uint8ClampedArray(image.data);
  const dst = image.data;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + x0 - center.x;
      const dy = y + y0 - center.y;
      // Rotate into head-aligned space and normalise to the ellipse
      const nx = (dx * cos + dy * sin) / rx;
      const ny = (-dx * sin + dy * cos) / ry;
      const r = Math.sqrt(nx * nx + ny * ny);
      if (r >= 1) continue;

      const [sx, sy] = mapping(nx, ny, r);
      const lx = sx * rx;
      const ly = sy * ry;
      // Back to canvas space, relative to the region
      const fx = Math.min(
        w - 1.001,
        Math.max(0, center.x + lx * cos - ly * sin - x0)
      );
      const fy = Math.min(
        h - 1.001,
        Math.max(0, center.y + lx * sin + ly * cos - y0)
      );

      const ix = fx | 0;
      const iy = fy | 0;
      const tx = fx - ix;
      const ty = fy - iy;
      const i00 = (iy * w + ix) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + w * 4;
      const i11 = i01 + 4;
      const out = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] + (src[i10 + c] - src[i00 + c]) * tx;
        const bottom = src[i01 + c] + (src[i11 + c] - src[i01 + c]) * tx;
        dst[out + c] = top + (bottom - top) * ty;
      }
    }
  }
  ctx.putImageData(image, x0, y0);
};

// Source radius = r^k: k > 1 magnifies the center, k < 1 shrinks it
const radialPower =
  (k: number): WarpMapping =>
  (nx, ny, r) => {
    const scale = r > 0 ? r ** (k - 1) : 0;
    return [nx * scale, ny * scale];
  };

export const warpBigEyes = (
  ctx: CanvasRenderingContext2D,
  face: FaceGeometry
) => {
  const radius = face.eyeDistance * 0.55;
  [face.eyeLeft, face.eyeRight].forEach((eye) =>
    warpRegion(ctx, eye, radius, radius * 0.85, face.roll, radialPower(1.9))
  );
};

// Shrinks the face; the softer power avoids smearing the surrounding hair
export const warpTinyFace = (
  ctx: CanvasRenderingContext2D,
  face: FaceGeometry
) =>
  warpRegion(
    ctx,
    face.faceCenter,
    face.faceWidth * 1.1,
    face.faceHeight * 1.05,
    face.roll,
    radialPower(0.68)
  );

export const warpBigNose = (
  ctx: CanvasRenderingContext2D,
  face: FaceGeometry
) => {
  const radius = face.eyeDistance * 0.7;
  warpRegion(ctx, face.nose, radius, radius, face.roll, radialPower(2.2));
};

export const warpWideMouth = (
  ctx: CanvasRenderingContext2D,
  face: FaceGeometry
) =>
  warpRegion(
    ctx,
    face.mouthCenter,
    face.mouthWidth * 1.3,
    face.mouthWidth * 0.75,
    face.roll,
    (nx, ny, r) => {
      const pull = 1 - 0.55 * (1 - r * r);
      return [nx * pull, ny * (1 - 0.15 * (1 - r * r))];
    }
  );

export const warpSquish = (ctx: CanvasRenderingContext2D, face: FaceGeometry) =>
  warpRegion(
    ctx,
    face.faceCenter,
    face.faceWidth * 1.05,
    face.faceHeight * 0.9,
    face.roll,
    (nx, ny, r) => {
      const falloff = 1 - r * r;
      return [nx * (1 - 0.35 * falloff), ny * (1 + 0.6 * falloff)];
    }
  );

export const warpSwirl = (ctx: CanvasRenderingContext2D, face: FaceGeometry) =>
  warpRegion(
    ctx,
    face.faceCenter,
    face.faceWidth * 0.85,
    face.faceWidth * 0.85,
    0,
    (nx, ny, r) => {
      const angle = 2.6 * (1 - r) ** 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return [nx * c - ny * s, nx * s + ny * c];
    }
  );
