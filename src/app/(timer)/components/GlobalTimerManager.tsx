"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { timerAtom, initialTimerState } from "@/application/atoms/timerAtom";
import { consumeAppCleanupRequestsAtom } from "@/application/atoms/appLifecycleAtoms";
import { playSound } from "@/infrastructure/lib/utils";
import { formatTime } from "@/app/(timer)/utils/timerUtils";

// Define the appId for this manager
const TIMER_APP_ID = "timer";

/**
 * GlobalTimerManager
 *
 * A global component that manages timer state regardless of window state.
 * - Uses a Web Worker to continue running when browser tab is inactive
 * - Updates document title to show timer status
 * - Plays sound when timer completes
 * - Resets when timer window is closed
 */
export const GlobalTimerManager = () => {
  const [timerState, setTimerState] = useAtom(timerAtom);
  const consumeCleanupRequests = useAtom(consumeAppCleanupRequestsAtom)[1];
  const alarmPlayedRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize the worker
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    // Create the worker
    const worker = new Worker("/timerWorker.js");

    // Set up message handler from worker
    worker.onmessage = (e) => {
      const { type, timeRemaining } = e.data;

      switch (type) {
        case "tick":
          // Update time remaining from worker
          if (timeRemaining !== timerState.timeRemaining) {
            setTimerState((prev) => ({
              ...prev,
              timeRemaining,
            }));
          }
          break;

        case "complete":
          // Timer finished
          if (!alarmPlayedRef.current) {
            alarmPlayedRef.current = true;
            playSound("/sounds/timeup.mp3");

            setTimerState((prev) => ({
              ...prev,
              isRunning: false,
              // Leave timeRemaining at 0 to ensure "Time is up!" title remains
              timeRemaining: 0,
            }));

            // Force the title update
            if (typeof window !== "undefined") {
              document.title = `⏰ Time is up!`;
            }
          }
          break;

        case "paused":
          // Timer paused
          setTimerState((prev) => ({
            ...prev,
            timeRemaining,
            isRunning: false,
          }));
          break;

        case "reset":
          // Timer reset
          alarmPlayedRef.current = false;
          break;
      }
    };

    // Handle timer reset event from outside this component
    const handleTimerReset = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ command: "reset" });
      }
    };

    // Listen for timer reset events
    window.addEventListener("timer-reset", handleTimerReset);

    // Store worker reference
    workerRef.current = worker;

    // Cleanup function
    return () => {
      worker.terminate();
      workerRef.current = null;
      window.removeEventListener("timer-reset", handleTimerReset);
    };
  }, [setTimerState, timerState.timeRemaining]);

  // Effect to handle application cleanup requests
  useEffect(() => {
    const cleanupRequests = consumeCleanupRequests(TIMER_APP_ID);
    const relevantRequest = cleanupRequests.find(
      (req) => req.windowId === timerState.windowId
    );

    if (relevantRequest) {
      console.log(
        `[GlobalTimerManager] Received cleanup request for window: ${relevantRequest.windowId}`
      );

      // Reset the timer state fully
      setTimerState(initialTimerState);
      alarmPlayedRef.current = false;

      // Tell the worker to reset
      if (workerRef.current) {
        workerRef.current.postMessage({ command: "reset" });
      }

      // Reset document title immediately
      if (typeof window !== "undefined") {
        document.title = "wfcOS";
      }
    }
  }, [consumeCleanupRequests, timerState.windowId, setTimerState]);

  // Control the worker based on timer state changes
  useEffect(() => {
    // Skip if no worker or no window
    if (!workerRef.current || typeof window === "undefined") return;

    const worker = workerRef.current;

    // When timer window is closed, terminate the worker
    if (!timerState.isActive || !timerState.windowId) {
      // Pause the worker before potentially cleaning up
      worker.postMessage({ command: "pause" });
      return;
    }

    // Handle timer state changes
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      // Start/resume the timer
      worker.postMessage({
        command: "start",
        timeRemaining: timerState.timeRemaining,
      });
      alarmPlayedRef.current = false;
    } else if (!timerState.isRunning && timerState.timeRemaining > 0) {
      // Pause the timer
      worker.postMessage({ command: "pause" });
    } else if (timerState.timeRemaining <= 0) {
      // Timer completed
      if (!alarmPlayedRef.current) {
        alarmPlayedRef.current = true;
        playSound("/sounds/timeup.mp3");

        setTimerState((prev) => ({
          ...prev,
          isRunning: false,
          // Ensure timeRemaining stays at 0
          timeRemaining: 0,
        }));

        // Force the title update
        if (typeof window !== "undefined") {
          document.title = `⏰ Time is up!`;
        }
      }
    }
  }, [
    timerState.isRunning,
    timerState.isActive,
    timerState.windowId,
    timerState.timeRemaining,
    setTimerState,
  ]);

  // Update document title to show timer status
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (timerState.isActive && timerState.isRunning) {
        // Show running timer in title (useful when minimized)
        document.title = `(${formatTime(
          timerState.timeRemaining
        )}) Timer - wfcOS`;
      } else if (timerState.isActive && timerState.timeRemaining <= 0) {
        // Show time's up message when timer completes
        document.title = `⏰ Time is up!`;
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
  }, [
    timerState.isRunning,
    timerState.isActive,
    timerState.isMinimized,
    timerState.timeRemaining,
  ]);

  // This component doesn't render any visible UI
  return null;
};
