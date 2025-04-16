"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAtom } from "jotai";
import {
  podomoroAtom,
  startPausePodomoroAtom,
  resetPodomoroAtom,
  switchToModeAtom,
  handlePodomoroTickCompletionAtom,
  decrementPodomoroTimeAtom,
  DurationSetting,
  setDurationSettingAtom,
  setCustomDurationAtom,
} from "../../atoms/podomoroAtom";
import { playSound } from "@/lib/utils";

// Global Timer Runner Component
export const GlobalPodomoroTimer = () => {
  const [podomoroState] = useAtom(podomoroAtom);
  const decrementTime = useAtom(decrementPodomoroTimeAtom)[1];
  const handleCompletion = useAtom(handlePodomoroTickCompletionAtom)[1];

  // Use ref to track if we've handled completion for the current timer
  const completionHandledRef = useRef(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Reset completion flag when timer starts or is reset
    if (podomoroState.isRunning && podomoroState.timeRemaining > 0) {
      completionHandledRef.current = false;

      intervalId = setInterval(() => {
        decrementTime();
      }, 1000);
    }
    // Handle timer completion
    else if (podomoroState.isRunning && podomoroState.timeRemaining <= 0) {
      // Clear any running interval first
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      // Only handle completion once per timer cycle
      if (!completionHandledRef.current) {
        completionHandledRef.current = true;
        playSound("/sounds/timeup.mp3");
        handleCompletion();
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    podomoroState.isRunning,
    podomoroState.timeRemaining,
    podomoroState.mode,
    decrementTime,
    handleCompletion,
  ]);

  return null;
};

const PodomoroTimer: React.FC = () => {
  // Read full state directly from the atom
  const [podomoroState] = useAtom(podomoroAtom);
  const {
    mode,
    timeRemaining,
    isRunning,
    workSessionsCompleted,
    durationSetting,
    customDurationMinutes,
  } = podomoroState;

  // Get setter functions for actions
  const startPause = useAtom(startPausePodomoroAtom)[1];
  const reset = useAtom(resetPodomoroAtom)[1];
  const setSetting = useAtom(setDurationSettingAtom)[1];
  const setCustomTime = useAtom(setCustomDurationAtom)[1];
  const switchMode = useAtom(switchToModeAtom)[1];

  // Local state for the custom input field and title
  const [localCustomMinutes, setLocalCustomMinutes] = useState<string>(
    customDurationMinutes.toString()
  );
  const [customTitle, setCustomTitle] = useState<string>("Custom");

  // Update local state when global state changes
  useEffect(() => {
    setLocalCustomMinutes(customDurationMinutes.toString());
  }, [customDurationMinutes]);

  const handleStartPause = () => {
    playSound("/sounds/click.mp3");
    startPause();
  };

  const handleReset = () => {
    playSound("/sounds/click.mp3");
    reset();
  };

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSetting = event.target.value as DurationSetting;
    setSetting(newSetting);

    // When changing to a specific mode, also switch the timer mode appropriately
    if (newSetting === "work25") {
      switchMode("work");
    } else if (newSetting === "short5") {
      switchMode("shortBreak");
    } else if (newSetting === "long15") {
      switchMode("longBreak");
    }

    playSound("/sounds/click.mp3");
  };

  const handleCustomTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalCustomMinutes(event.target.value);
  };

  const handleCustomTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomTitle(event.target.value);
  };

  const updateGlobalCustomTime = () => {
    const newMinutes = parseInt(localCustomMinutes, 10);
    if (!isNaN(newMinutes) && newMinutes !== customDurationMinutes) {
      setCustomTime(newMinutes);
      playSound("/sounds/click.mp3");
    } else if (isNaN(newMinutes)) {
      setLocalCustomMinutes(customDurationMinutes.toString());
    }
  };

  const handleCustomTimeKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      updateGlobalCustomTime();
      (event.target as HTMLInputElement).blur();
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

  // Get the display title based on mode and setting
  const getDisplayTitle = (): string => {
    if (durationSetting === "custom") {
      return customTitle;
    }

    switch (mode) {
      case "work":
        return "Work";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Timer";
    }
  };

  // Duration setting options with descriptive labels
  const durationOptions: {
    value: DurationSetting;
    label: string;
    description: string;
  }[] = [
    {
      value: "work25",
      label: "Work (25min)",
      description: "Focus time for maximum productivity",
    },
    {
      value: "short5",
      label: "Short Break (5min)",
      description: "Quick refreshment between work sessions",
    },
    {
      value: "long15",
      label: "Long Break (15min)",
      description: "Extended rest after multiple work sessions",
    },
    {
      value: "custom",
      label: "Custom Timer",
      description: "Set your own timer duration and title",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between text-secondary h-full p-4">
      {/* Timer Display Area */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl font-semibold mb-2">{getDisplayTitle()}</h2>
        <div className="text-6xl font-mono mb-4 tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleStartPause}
            className={`px-4 py-2 rounded text-white transition w-20 ${
              isRunning
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-300 text-secondary rounded hover:bg-gray-400 transition w-20"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Settings Area */}
      <div className="w-full border-t pt-4">
        <h3 className="text-sm font-medium mb-2 text-center">Timer Settings</h3>
        <div className="flex flex-col gap-2">
          {durationOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-start p-2 cursor-pointer rounded hover:bg-gray-100"
            >
              <input
                type="radio"
                name="durationSetting"
                value={option.value}
                checked={durationSetting === option.value}
                onChange={handleSettingChange}
                className="mt-1 cursor-pointer"
              />
              <div className="ml-2 w-full">
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">
                  {option.description}
                </div>

                {/* Custom Time & Title Input - appears only when custom is selected */}
                {option.value === "custom" && durationSetting === "custom" && (
                  <div className="flex flex-col mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <label htmlFor="customTitle" className="text-xs">
                        Title:
                      </label>
                      <input
                        id="customTitle"
                        type="text"
                        value={customTitle}
                        onChange={handleCustomTitleChange}
                        className="flex-1 px-2 py-0.5 border border-gray-300 rounded text-secondary bg-background text-xs"
                        placeholder="Custom Timer Title"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="customTime" className="text-xs">
                        Minutes:
                      </label>
                      <input
                        id="customTime"
                        type="number"
                        min="1"
                        value={localCustomMinutes}
                        onChange={handleCustomTimeChange}
                        onBlur={updateGlobalCustomTime}
                        onKeyDown={handleCustomTimeKeyDown}
                        className="w-16 px-1 py-0.5 border border-gray-300 rounded text-secondary bg-background text-center text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center mt-4 text-sm text-gray-500">
        <div>Completed Sessions: {workSessionsCompleted}</div>

        <div className="mt-3 text-xs text-gray-400 border-t pt-2">
          <p className="font-medium mb-1">Pomodoro Method (25/5/15)</p>
          <p>25min work, 5min short break, 15min long break every 4 cycles</p>
        </div>
      </div>
    </div>
  );
};

export default PodomoroTimer;
