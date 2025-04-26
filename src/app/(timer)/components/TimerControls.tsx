"use client";

import { useAtom } from "jotai";
import { startPauseTimerAtom, resetTimerAtom } from "@/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";

interface TimerControlsProps {
  isRunning: boolean;
}

export const TimerControls = ({ isRunning }: TimerControlsProps) => {
  const startPause = useAtom(startPauseTimerAtom)[1];
  const reset = useAtom(resetTimerAtom)[1];

  const handleStartPause = () => {
    playSound("/sounds/click.mp3");
    startPause();
  };

  const handleReset = () => {
    playSound("/sounds/click.mp3");
    reset();
  };

  return (
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
  );
};

export default TimerControls;
