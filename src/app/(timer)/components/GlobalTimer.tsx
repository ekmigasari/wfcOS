"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { timerAtom, decrementTimerAtom } from "@/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { formatTime } from "../utils/timerUtils";

export const GlobalTimer = () => {
  const [timerState] = useAtom(timerAtom);
  const decrementTime = useAtom(decrementTimerAtom)[1];
  const alarmPlayedRef = useRef(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Start timer if running and time remains
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      alarmPlayedRef.current = false;
      intervalId = setInterval(() => {
        decrementTime();
      }, 1000);
    }
    // Handle timer completion
    else if (timerState.timeRemaining <= 0 && !alarmPlayedRef.current) {
      alarmPlayedRef.current = true;
      playSound("/sounds/timeup.mp3");
    }

    // Worker to keep timer running even when tab is not active
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Let the timer continue running even when tab is not in focus
      document.title = timerState.isRunning
        ? `(${formatTime(timerState.timeRemaining)}) Timer`
        : "Timer";
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerState.isRunning, timerState.timeRemaining, decrementTime]);

  return null;
};
