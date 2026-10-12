"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

/**
 * Manages the webcam stream. The stream only runs while `active` is true so
 * the camera light turns off when the window is minimized or on another tab.
 */
export const useCamera = (active: boolean) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [retryToken, setRetryToken] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!active) {
      stopStream();
      setStatus("idle");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setStatus("ready");
      })
      .catch((error: DOMException) => {
        if (cancelled) return;
        if (
          error.name === "NotAllowedError" ||
          error.name === "SecurityError"
        ) {
          setStatus("denied");
        } else if (
          error.name === "NotFoundError" ||
          error.name === "OverconstrainedError"
        ) {
          setStatus("unavailable");
        } else {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [active, retryToken, stopStream]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  return { videoRef, status, retry };
};
