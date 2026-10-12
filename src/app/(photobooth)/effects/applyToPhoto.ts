"use client";

import type { PhotoEffect } from ".";
import { getFaceGeometry } from "./faceGeometry";
import { detectFaces, loadFaceLandmarker } from "./faceTracker";

// Bakes an effect into an uploaded photo (data URL in, data URL out)
export const applyEffectToPhoto = async (
  photo: string,
  effect: PhotoEffect
): Promise<string> => {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read photo"));
    image.src = photo;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return photo;
  ctx.drawImage(img, 0, 0);

  let faces: ReturnType<typeof getFaceGeometry>[] = [];
  if (effect.needsFace) {
    try {
      const landmarker = await loadFaceLandmarker();
      faces = detectFaces(landmarker, canvas, canvas.width, canvas.height).map(
        getFaceGeometry
      );
    } catch (error) {
      console.error("Face tracker unavailable for upload", error);
      return photo;
    }
  }

  effect.apply(ctx, faces, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
};
