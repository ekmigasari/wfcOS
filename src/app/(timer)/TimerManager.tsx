"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  restartAndGoAtom,
  stopAlarmAtom,
  timerAtom,
} from "@/application/atoms/timerAtom";
import {
  addSessionAtom,
  selectedTaskForTimerAtom,
} from "@/application/atoms/sessionAtoms";
import { formatTime, getDisplayTitle } from "./utils/timerUtils";

/**
 * TimerManager - Handles timer web worker communication
 *
 * This component doesn't render anything visible but manages the timer web worker
 * and syncs its state with the global timer state.
 */
export const TimerManager = () => {
  const [timerState, setTimerState] = useAtom(timerAtom);
  const { isAlarming } = useAtomValue(timerAtom);
  const selectedTaskId = useAtomValue(selectedTaskForTimerAtom);
  const [, addNewSession] = useAtom(addSessionAtom);
  const [, restart] = useAtom(restartAndGoAtom);
  const [, stopAlarm] = useAtom(stopAlarmAtom);
  const workerRef = useRef<Worker | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitle = useRef<string>("");

  // Effect to handle manual alarm stop
  useEffect(() => {
    // If isAlarming is false and there's an active alarm sound, stop it.
    if (!isAlarming && alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      // Remove the onended listener to prevent auto-restarting
      alarmAudioRef.current.onended = null;
      alarmAudioRef.current = null;
    }
  }, [isAlarming]);

  // Initialize web worker and handle notifications - runs once on mount
  useEffect(() => {
    // Only run in browser context
    if (typeof window === "undefined") return;

    // Store the original document title
    originalTitle.current = document.title;

    // Create worker with the new path
    const worker = new Worker("/lib/timerWorker.js");
    workerRef.current = worker;

    // Handle messages from worker
    worker.onmessage = (e) => {
      const { type, timeRemaining } = e.data;

      switch (type) {
        case "tick":
          // Update time remaining
          setTimerState((prev) => ({
            ...prev,
            timeRemaining: timeRemaining,
          }));
          break;

        case "complete":
          // Timer completed - play sound directly using Audio API
          const audio = new Audio("/sounds/timeup.mp3");
          alarmAudioRef.current = audio;

          // When the sound finishes, transition the state to allow restart
          audio.onended = () => {
            stopAlarm();
            alarmAudioRef.current = null;
          };

          audio.play().catch((error) => {
            console.error("Error playing timer completion sound:", error);
            alarmAudioRef.current = null; // Clean up on error
          });

          // Show completion message in browser title
          document.title = "Time is up!";

          // Show notification if permitted
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Time is up!", {
              body: "Your timer has completed.",
              icon: "/icons/clock.png",
            });
          }

          // Log session if it was a work timer
          if (
            timerState.timerSetting === "work25" &&
            timerState.sessionStartTime &&
            timerState.workCycleDuration
          ) {
            const endTime = Date.now();
            const durationInMinutes = Math.round(
              timerState.workCycleDuration / 60
            );

            addNewSession({
              taskId: selectedTaskId,
              startTime: timerState.sessionStartTime,
              endTime: endTime,
              duration: durationInMinutes, // Ensure this is in minutes
            });
          }

          setTimerState((prev) => ({
            ...prev,
            isRunning: false,
            sessionStartTime: null, // Clear session start time after completion
            isAlarming: true, // Start the alarm
            // workCycleDuration can remain as is, or be reset, depends on desired flow for next timer start
          }));
          break;

        case "reset":
          // Timer was reset by the worker
          setTimerState((prev) => ({
            ...prev,
            isRunning: false,
          }));
          break;

        case "paused":
          // Timer was paused
          setTimerState((prev) => ({
            ...prev,
            timeRemaining: timeRemaining,
            isRunning: false,
          }));
          break;
      }
    };

    // Listen for global reset event
    const handleReset = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          command: "reset",
        });
      }

      // Restore original title
      document.title = originalTitle.current;
    };

    // Add event listener for resets triggered elsewhere
    window.addEventListener("timer-reset", handleReset);

    // Request notification permission when TimerManager mounts
    if (
      typeof Notification !== "undefined" &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      window.removeEventListener("timer-reset", handleReset);

      // Restore original title on unmount
      document.title = originalTitle.current;
    };
  }, [
    setTimerState,
    selectedTaskId,
    addNewSession,
    timerState.timerSetting,
    timerState.sessionStartTime,
    timerState.workCycleDuration,
    restart,
    stopAlarm,
  ]); // Only depends on the stable setTimerState function

  // Update document title when timer state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (timerState.isRunning) {
      const formattedTime = formatTime(timerState.timeRemaining);
      const displayTitle = getDisplayTitle(
        timerState.timerSetting,
        timerState.customTitle
      );
      document.title = `${formattedTime} - ${displayTitle}`;
    } else if (timerState.timeRemaining === 0) {
      document.title = "Time is up!";
    } else {
      document.title = originalTitle.current;
    }
  }, [
    timerState.isRunning,
    timerState.timeRemaining,
    timerState.timerSetting,
    timerState.customTitle,
  ]);

  // Control worker based on timer state changes
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    if (timerState.isRunning) {
      // Start/resume the timer
      worker.postMessage({
        command: "start",
        timeRemaining: timerState.timeRemaining,
      });
    } else {
      // Pause the timer
      worker.postMessage({
        command: "pause",
      });
    }
  }, [timerState.isRunning, timerState.timeRemaining]);

  // This component doesn't render anything
  return null;
};

export default TimerManager;
