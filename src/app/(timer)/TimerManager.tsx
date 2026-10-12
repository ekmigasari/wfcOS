"use client";

import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { addSessionAtom } from "@/application/atoms/sessionAtoms";
import { stopAlarmAtom, timerAtom } from "@/application/atoms/timerAtom";
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
  const [, addNewSession] = useAtom(addSessionAtom);
  const [, stopAlarm] = useAtom(stopAlarmAtom);
  const workerRef = useRef<Worker | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitle = useRef<string>("");
  const timerStateRef = useRef(timerState);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  const stopAlarmPlayback = () => {
    if (!alarmAudioRef.current) return;

    alarmAudioRef.current.pause();
    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current.onended = null;
    alarmAudioRef.current = null;
  };

  const startAlarmPlayback = () => {
    stopAlarmPlayback();

    const audio = new Audio("/sounds/timeup.mp3");
    alarmAudioRef.current = audio;
    audio.onended = () => {
      stopAlarm();
      alarmAudioRef.current = null;
    };

    audio.play().catch((error) => {
      console.error("Error playing timer completion sound:", error);
      alarmAudioRef.current = null;
    });
  };

  const logCompletedSession = (state = timerStateRef.current) => {
    if (
      state.timerSetting !== "work25" ||
      !state.sessionStartTime ||
      !state.workCycleDuration ||
      state.completionLogged
    ) {
      return false;
    }

    addNewSession({
      taskId: state.activeTaskId,
      startTime: state.sessionStartTime,
      endTime: state.expectedEndTime ?? Date.now(),
      duration: Math.round(state.workCycleDuration / 60),
    });

    return true;
  };

  // Effect to handle manual alarm stop
  useEffect(() => {
    if (!isAlarming && alarmAudioRef.current) {
      stopAlarmPlayback();
    }
  }, [isAlarming]);

  useEffect(() => {
    if (timerState.isAlarming && !alarmAudioRef.current) {
      startAlarmPlayback();
    }
  }, [timerState.isAlarming]);

  // Initialize web worker and recover timer state - runs once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    originalTitle.current = document.title;

    const worker = new Worker("/lib/timerWorker.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, timeRemaining } = e.data;

      switch (type) {
        case "tick":
          setTimerState((prev) => ({
            ...prev,
            timeRemaining: timeRemaining,
          }));
          break;

        case "complete":
          const didLogCompletion = logCompletedSession();
          startAlarmPlayback();
          document.title = "Time is up!";

          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Time is up!", {
              body: "Your timer has completed.",
              icon: "/icons/clock.png",
            });
          }

          setTimerState((prev) => ({
            ...prev,
            isRunning: false,
            timeRemaining: 0,
            isAlarming: true,
            startedAt: null,
            expectedEndTime: null,
            completionLogged: prev.completionLogged || didLogCompletion,
          }));
          break;

        case "reset":
          setTimerState((prev) => ({
            ...prev,
            isRunning: false,
            startedAt: null,
            expectedEndTime: null,
          }));
          break;

        case "paused":
          setTimerState((prev) => ({
            ...prev,
            timeRemaining: timeRemaining,
            isRunning: false,
            startedAt: null,
            expectedEndTime: null,
          }));
          break;
      }
    };

    const handleReset = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          command: "reset",
        });
      }

      // Restore original title
      document.title = originalTitle.current;
    };

    window.addEventListener("timer-reset", handleReset);

    if (
      typeof Notification !== "undefined" &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

    const recoverTimerState = () => {
      const snapshot = timerStateRef.current;

      if (snapshot.isAlarming) {
        document.title = "Time is up!";
        startAlarmPlayback();
        return;
      }

      if (!snapshot.isRunning || !snapshot.expectedEndTime) {
        return;
      }

      const now = Date.now();
      const remainingSeconds = Math.max(
        0,
        Math.ceil((snapshot.expectedEndTime - now) / 1000)
      );

      if (remainingSeconds > 0) {
        setTimerState((prev) => ({
          ...prev,
          timeRemaining: remainingSeconds,
          isRunning: true,
          startedAt: now,
        }));
        return;
      }

      const didLogCompletion = logCompletedSession(snapshot);
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: 0,
        isRunning: false,
        isAlarming: true,
        startedAt: null,
        expectedEndTime: null,
        completionLogged: prev.completionLogged || didLogCompletion,
      }));

      document.title = "Time is up!";
      startAlarmPlayback();
    };

    recoverTimerState();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      window.removeEventListener("timer-reset", handleReset);
      stopAlarmPlayback();
      document.title = originalTitle.current;
    };
  }, [addNewSession, setTimerState, stopAlarm]);

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
      worker.postMessage({
        command: "start",
        timeRemaining: timerState.timeRemaining,
      });
    } else {
      worker.postMessage({
        command: "pause",
      });
    }
  }, [timerState.isRunning, timerState.timeRemaining]);

  // This component doesn't render anything
  return null;
};

export default TimerManager;
