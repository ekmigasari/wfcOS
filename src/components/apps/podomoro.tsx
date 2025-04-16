"use client";

import React, { useState, useEffect, useCallback } from "react";

const WORK_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const LONG_BREAK_TIME = 15 * 60; // 15 minutes

type TimerMode = "work" | "shortBreak" | "longBreak";

const PodomoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeRemaining, setTimeRemaining] = useState<number>(WORK_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState<number>(0);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setIsRunning(false); // Stop timer on mode switch
      switch (newMode) {
        case "work":
          setTimeRemaining(WORK_TIME);
          break;
        case "shortBreak":
          setTimeRemaining(SHORT_BREAK_TIME);
          break;
        case "longBreak":
          setTimeRemaining(LONG_BREAK_TIME);
          break;
      }
    },
    [] // No dependencies needed as constants are outside
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      // Timer finished
      setIsRunning(false);
      // Play a sound or notification here? (Future enhancement)

      if (mode === "work") {
        const newSessionCount = workSessionsCompleted + 1;
        setWorkSessionsCompleted(newSessionCount);
        // After 4 work sessions, take a long break, otherwise short break
        switchMode(newSessionCount % 4 === 0 ? "longBreak" : "shortBreak");
      } else {
        // After break, switch back to work
        switchMode("work");
      }
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeRemaining, mode, workSessionsCompleted, switchMode]);

  const handleStartPause = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    // Reset to the current mode's default time
    switch (mode) {
      case "work":
        setTimeRemaining(WORK_TIME);
        break;
      case "shortBreak":
        setTimeRemaining(SHORT_BREAK_TIME);
        break;
      case "longBreak":
        setTimeRemaining(LONG_BREAK_TIME);
        break;
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getModeName = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case "work":
        return "Work";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-secondary h-full">
      <h2 className="text-xl font-semibold mb-2">{getModeName(mode)}</h2>
      <div className="text-6xl font-mono mb-4">{formatTime(timeRemaining)}</div>
      <div className="flex space-x-4">
        <button
          onClick={handleStartPause}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-300 text-secondary rounded hover:bg-gray-400 transition"
        >
          Reset
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Completed Sessions: {workSessionsCompleted}
      </div>
      {/* Optional: Add mode switching buttons later if needed */}
      {/* <div className="mt-6 flex space-x-2">
           <button onClick={() => switchMode('work')} className={`px-2 py-1 text-xs rounded ${mode === 'work' ? 'bg-blue-200' : 'bg-gray-200'}`}>Work</button>
           <button onClick={() => switchMode('shortBreak')} className={`px-2 py-1 text-xs rounded ${mode === 'shortBreak' ? 'bg-green-200' : 'bg-gray-200'}`}>Short Break</button>
           <button onClick={() => switchMode('longBreak')} className={`px-2 py-1 text-xs rounded ${mode === 'longBreak' ? 'bg-yellow-200' : 'bg-gray-200'}`}>Long Break</button>
       </div> */}
    </div>
  );
};

export default PodomoroTimer;
