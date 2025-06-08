"use client";

import { RotateCcwIcon } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  timeRemaining: number;
  workCycleDuration: number;
  isAlarming: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onRestartAndGo: () => void;
  onStopAlarm: () => void;
}

export const TimerControls = ({
  isRunning,
  timeRemaining,
  workCycleDuration,
  isAlarming,
  onStartPause,
  onReset,
  onRestartAndGo,
  onStopAlarm,
}: TimerControlsProps) => {
  if (isAlarming) {
    return (
      <div className="flex my-4 justify-center">
        <button
          onClick={onStopAlarm}
          className="px-12 py-2 rounded text-white transition bg-red-500 hover:bg-red-600"
        >
          Stop Alarm
        </button>
      </div>
    );
  }

  let buttonLabel = "Start";
  let buttonAction = onStartPause;

  if (timeRemaining <= 0 && !isRunning) {
    buttonLabel = "Restart";
    buttonAction = onRestartAndGo;
  } else if (isRunning) {
    buttonLabel = "Pause";
    buttonAction = onStartPause;
  } else {
    if (timeRemaining < workCycleDuration) {
      buttonLabel = "Resume";
    } else {
      buttonLabel = "Start";
    }
    buttonAction = onStartPause;
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={buttonAction}
        className={`px-12 py-2 rounded text-white transition min-w-[120px] ${
          isRunning
            ? "bg-orange-500 hover:bg-orange-600"
            : buttonLabel === "Restart"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-primary hover:bg-secondary"
        }`}
      >
        {buttonLabel}
      </button>
      <button
        onClick={onReset}
        className="px-2 py-2 bg-gray-300 text-secondary rounded hover:bg-background transition"
      >
        <RotateCcwIcon />
      </button>
    </div>
  );
};

export default TimerControls;
