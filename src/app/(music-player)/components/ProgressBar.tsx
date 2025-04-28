"use client";

import React from "react";
import { formatTime, createProgressGradient } from "../utils/playerUtils";

interface ProgressBarProps {
  playedSeconds: number;
  duration: number;
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeekMouseDown: () => void;
  handleSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const ProgressBar = ({
  playedSeconds,
  duration,
  handleSeekChange,
  handleSeekMouseDown,
  handleSeekMouseUp,
  disabled
}: ProgressBarProps) => {
  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Seek Slider */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={playedSeconds}
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          disabled={disabled}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          style={{
            background: createProgressGradient(playedSeconds, duration)
          }}
        />

        {/* Time Display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(playedSeconds)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar; 