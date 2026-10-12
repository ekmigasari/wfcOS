"use client";

import type { FaceLandmarker } from "@mediapipe/tasks-vision";

// The WASM runtime (~11MB) is loaded from the CDN pinned to the installed
// version; the smaller face model is self-hosted in public/models.
const WASM_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "/models/face_landmarker.task";
const MAX_FACES = 4;

export type TrackerStatus = "idle" | "loading" | "ready" | "error";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

// GPU delegate on a software WebGL renderer is several times slower than CPU
const hasSoftwareWebGL = () => {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return true;
  }
};

let lastTimestamp = 0;

// MediaPipe's WASM writes routine info lines (glog "W1012 …", "Created
// TensorFlow Lite XNNPACK delegate") to stderr, which surfaces as
// console.error and trips the Next.js dev error overlay. Only those lines are
// dropped, and only while MediaPipe code is running.
const MEDIAPIPE_NOISE =
  /XNNPACK delegate|^[IW]\d{4} \d|gl_context\.cc|OpenGL error checking|FaceBlendshapesGraph/;
let quietDepth = 0;
let originalConsole: Pick<Console, "error" | "warn" | "info" | "log"> | null =
  null;

const muteMediapipe = () => {
  if (quietDepth++ > 0) return;
  originalConsole = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    log: console.log,
  };
  for (const level of ["error", "warn", "info", "log"] as const) {
    const original = originalConsole[level];
    console[level] = (...args: unknown[]) => {
      if (typeof args[0] === "string" && MEDIAPIPE_NOISE.test(args[0])) return;
      original(...args);
    };
  }
};

const unmuteMediapipe = () => {
  if (--quietDepth > 0 || !originalConsole) return;
  Object.assign(console, originalConsole);
  originalConsole = null;
};

const quietly = <T>(run: () => T): T => {
  muteMediapipe();
  try {
    return run();
  } finally {
    unmuteMediapipe();
  }
};

const quietlyAsync = async <T>(run: () => Promise<T>): Promise<T> => {
  muteMediapipe();
  try {
    return await run();
  } finally {
    unmuteMediapipe();
  }
};

const createLandmarker = async (): Promise<FaceLandmarker> => {
  const { FaceLandmarker, FilesetResolver } = await import(
    "@mediapipe/tasks-vision"
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
  const options = (delegate: "GPU" | "CPU") => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: "VIDEO" as const,
    numFaces: MAX_FACES,
  });
  if (hasSoftwareWebGL()) {
    return await FaceLandmarker.createFromOptions(fileset, options("CPU"));
  }
  try {
    return await FaceLandmarker.createFromOptions(fileset, options("GPU"));
  } catch {
    // Some devices have no usable WebGL; CPU is slower but works everywhere
    return await FaceLandmarker.createFromOptions(fileset, options("CPU"));
  }
};

// Lazily creates a single shared landmarker; retries after a failure
export const loadFaceLandmarker = (): Promise<FaceLandmarker> => {
  if (!landmarkerPromise) {
    landmarkerPromise = quietlyAsync(createLandmarker).catch((error) => {
      landmarkerPromise = null;
      throw error;
    });
  }
  return landmarkerPromise;
};

export interface Point {
  x: number;
  y: number;
}

/** Landmarks of one face, converted to pixel coordinates of the target canvas */
export type FaceLandmarks = Point[];

/**
 * Detects faces in a video frame or image. Timestamps must increase across
 * calls in VIDEO mode, so a shared monotonic clock is used for both.
 */
export const detectFaces = (
  landmarker: FaceLandmarker,
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): FaceLandmarks[] => {
  const now = performance.now();
  lastTimestamp = now > lastTimestamp ? now : lastTimestamp + 1;
  const result = quietly(() =>
    landmarker.detectForVideo(source, lastTimestamp)
  );
  return result.faceLandmarks.map((landmarks) =>
    landmarks.map((point) => ({
      x: point.x * width,
      y: point.y * height,
    }))
  );
};
