"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playCountdownBeep, playShutter } from "../utils/sounds";

const PAUSE_BETWEEN_SHOTS_MS = 900;

/**
 * Runs the countdown → flash → capture loop for one or more slots.
 * `capture(slotIndex)` must grab the frame and return false if it failed.
 */
export const useCaptureSequence = (
  countdownSeconds: number,
  capture: (slotIndex: number) => boolean
) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const runIdRef = useRef(0);
  const captureRef = useRef(capture);
  captureRef.current = capture;

  const cancel = useCallback(() => {
    runIdRef.current += 1;
    setCountdown(null);
    setActiveSlot(null);
  }, []);

  // Stop any running sequence when the component unmounts
  useEffect(() => cancel, [cancel]);

  const start = useCallback(
    async (slotIndexes: number[]) => {
      const runId = ++runIdRef.current;
      const isCurrent = () => runIdRef.current === runId;
      const wait = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, ms));

      for (let i = 0; i < slotIndexes.length; i++) {
        const slot = slotIndexes[i];
        setActiveSlot(slot);

        for (let n = countdownSeconds; n > 0; n--) {
          if (!isCurrent()) return;
          setCountdown(n);
          playCountdownBeep(n === 1);
          await wait(1000);
        }
        if (!isCurrent()) return;

        setCountdown(null);
        playShutter();
        setFlashKey((k) => k + 1);
        if (!captureRef.current(slot)) {
          cancel();
          return;
        }

        if (i < slotIndexes.length - 1) await wait(PAUSE_BETWEEN_SHOTS_MS);
      }

      if (isCurrent()) setActiveSlot(null);
    },
    [countdownSeconds, cancel]
  );

  return {
    countdown,
    activeSlot,
    flashKey,
    isRunning: activeSlot !== null,
    start,
    cancel,
  };
};
