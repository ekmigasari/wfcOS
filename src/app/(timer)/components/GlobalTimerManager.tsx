"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { timerAtom } from "@/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { formatTime } from "@/app/(timer)/utils/timerUtils";

/**
 * GlobalTimerManager
 *
 * A global component that manages timer state regardless of window state.
 * - Continues running when window is minimized
 * - Updates document title to show timer status
 * - Plays sound when timer completes
 * - Resets when timer window is closed
 * - Uses system clock for accurate timing
 */
export const GlobalTimerManager = () => {
  const [timerState, setTimerState] = useAtom(timerAtom);
  const alarmPlayedRef = useRef(false);
  const timerStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup function to cancel animation frame
    const cleanup = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    // Reset the timer start reference when the timer is stopped
    if (!timerState.isRunning) {
      timerStartTimeRef.current = null;
      lastUpdateTimeRef.current = null;
      cleanup();
      return;
    }

    // Only run the timer if it's active (window is open or minimized, but not closed)
    if (
      timerState.isActive &&
      timerState.isRunning &&
      timerState.timeRemaining > 0
    ) {
      // If this is the first time the timer is running, set the start time
      if (timerStartTimeRef.current === null) {
        timerStartTimeRef.current = Date.now();
        lastUpdateTimeRef.current = Date.now();
      }

      // Function to update the timer using requestAnimationFrame for better accuracy
      const updateTimer = () => {
        if (!timerState.isRunning || !timerState.isActive) {
          cleanup();
          return;
        }

        const currentTime = Date.now();

        // Only update once per second (1000ms) to ensure we count down in whole seconds
        if (
          lastUpdateTimeRef.current &&
          currentTime - lastUpdateTimeRef.current < 1000
        ) {
          animationFrameRef.current = requestAnimationFrame(updateTimer);
          return;
        }

        // Calculate seconds elapsed since last update
        const secondsElapsed = lastUpdateTimeRef.current
          ? Math.floor((currentTime - lastUpdateTimeRef.current) / 1000)
          : 0;

        // Only update if at least one second has passed
        if (secondsElapsed > 0) {
          // Update the last update time
          lastUpdateTimeRef.current = currentTime;

          // Calculate new time remaining, ensuring we don't go below 0
          const newTimeRemaining = Math.max(
            0,
            timerState.timeRemaining - secondsElapsed
          );

          // Only update state if time has changed
          if (newTimeRemaining !== timerState.timeRemaining) {
            setTimerState((prev) => ({
              ...prev,
              timeRemaining: newTimeRemaining,
            }));

            // Handle timer completion
            if (newTimeRemaining <= 0 && !alarmPlayedRef.current) {
              alarmPlayedRef.current = true;
              playSound("/sounds/timeup.mp3");

              // Stop the timer
              setTimerState((prev) => ({
                ...prev,
                isRunning: false,
              }));

              cleanup();
              return;
            }
          }
        }

        // Continue animation frame loop
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      // Start the animation frame loop and clean up any existing one
      cleanup();
      animationFrameRef.current = requestAnimationFrame(updateTimer);
      alarmPlayedRef.current = false;
    }
    // Handle timer completion directly if time is already at 0
    else if (
      timerState.isActive &&
      timerState.timeRemaining <= 0 &&
      !alarmPlayedRef.current
    ) {
      alarmPlayedRef.current = true;
      playSound("/sounds/timeup.mp3");

      // Stop the timer
      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
      }));
    }

    // Update document title to show timer status
    if (typeof window !== "undefined") {
      if (timerState.isActive && timerState.isRunning) {
        // Show running timer in title (useful when minimized)
        document.title = `(${formatTime(
          timerState.timeRemaining
        )}) Timer - wfcOS`;
      } else if (
        timerState.isActive &&
        !timerState.isRunning &&
        timerState.isMinimized
      ) {
        // Indicate paused timer when minimized
        document.title = `(Paused) Timer - wfcOS`;
      } else if (!timerState.isActive) {
        // Reset title when timer is not active
        document.title = "wfcOS";
      }
    }

    // Cleanup when unmounting or when dependencies change
    return cleanup;
  }, [
    timerState.isRunning,
    timerState.isActive,
    timerState.isMinimized,
    timerState.timeRemaining,
    setTimerState,
  ]);

  // This component doesn't render any visible UI
  return null;
};
