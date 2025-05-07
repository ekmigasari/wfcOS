"use client";

import { RotateCcwIcon } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

export const TimerControls = ({
  isRunning,
  onStartPause,
  onReset,
}: TimerControlsProps) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onStartPause}
        className={`px-8 py-2 rounded text-white transition ${
          isRunning
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-primary hover:bg-secondary"
        }`}
      >
        {isRunning ? "Pause" : "Start"}
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
