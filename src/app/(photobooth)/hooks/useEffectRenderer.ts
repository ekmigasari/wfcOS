"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import type { PhotoEffect } from "../effects";
import { getFaceGeometry } from "../effects/faceGeometry";
import {
  detectFaces,
  loadFaceLandmarker,
  type TrackerStatus,
} from "../effects/faceTracker";

const MAX_WIDTH = 960;
// Face detection runs at most ~15 fps and backs off on slow devices so it
// never takes more than about a third of the main thread; frames in between
// reuse the last landmarks.
const MIN_DETECT_INTERVAL_MS = 66;

/**
 * Draws the camera into a canvas every frame and applies the selected effect.
 * The canvas is what gets captured, so the effect is baked into the shot.
 */
export const useEffectRenderer = (
  videoRef: RefObject<HTMLVideoElement | null>,
  effect: PhotoEffect | null,
  mirror: boolean,
  active: boolean
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus>("idle");
  const [faceCount, setFaceCount] = useState(0);
  const needsFace = effect?.needsFace ?? false;

  useEffect(() => {
    if (!active || !effect) return;
    let cancelled = false;
    let frame = 0;
    let landmarker: Awaited<ReturnType<typeof loadFaceLandmarker>> | null =
      null;
    let lastFaceCount = -1;
    let lastDetect = 0;
    let detectInterval = MIN_DETECT_INTERVAL_MS;
    let faces: ReturnType<typeof getFaceGeometry>[] = [];

    if (needsFace) {
      setTrackerStatus("loading");
      loadFaceLandmarker()
        .then((instance) => {
          if (cancelled) return;
          landmarker = instance;
          setTrackerStatus("ready");
        })
        .catch((error) => {
          console.error("Face tracker failed to load", error);
          if (!cancelled) setTrackerStatus("error");
        });
    }

    const tick = (time: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });

      if (video && canvas && ctx && video.readyState >= 2 && video.videoWidth) {
        const width = Math.min(MAX_WIDTH, video.videoWidth);
        const height = Math.round(
          (video.videoHeight * width) / video.videoWidth
        );
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.save();
        if (mirror) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();

        if (needsFace && landmarker && time - lastDetect >= detectInterval) {
          lastDetect = time;
          try {
            // Detect on the frame just drawn (already mirrored), before the effect is applied
            const started = performance.now();
            faces = detectFaces(landmarker, canvas, width, height).map(
              getFaceGeometry
            );
            const took = performance.now() - started;
            detectInterval = Math.max(MIN_DETECT_INTERVAL_MS, took * 3);
          } catch (error) {
            console.error("Face detection failed", error);
          }
        }
        effect.apply(ctx, faces, time);

        if (faces.length !== lastFaceCount) {
          lastFaceCount = faces.length;
          setFaceCount(faces.length);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [active, effect, mirror, needsFace, videoRef]);

  return {
    canvasRef,
    trackerStatus: needsFace ? trackerStatus : "idle",
    faceCount,
  };
};
