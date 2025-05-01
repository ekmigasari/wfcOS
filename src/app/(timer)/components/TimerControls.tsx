"use client";

// Removed unused import
// import { playSound } from "@/infrastructure/lib/utils";

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
    <div className="flex space-x-4">
      <button
        onClick={onStartPause}
        className={`px-4 py-2 rounded text-white transition w-20 ${
          isRunning
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-primary hover:bg-primary-dark"
        }`}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-300 text-secondary rounded hover:bg-gray-400 transition w-20"
      >
        Reset
      </button>
    </div>
  );
};

export default TimerControls;
