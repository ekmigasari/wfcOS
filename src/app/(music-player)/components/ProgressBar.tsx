"use client";

import { useState, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  playerTimeAtom,
  setSeekPositionAtom,
  updatePlayerInternalsAtom,
} from "@/application/atoms/musicPlayerAtom";

// Helper to format time (MM:SS)
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "0:00";
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const ProgressBar = () => {
  const [timeState] = useAtom(playerTimeAtom);
  const setSeekPosition = useSetAtom(setSeekPositionAtom);
  const updatePlayerInternals = useSetAtom(updatePlayerInternalsAtom);

  const [localSliderValue, setLocalSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalSliderValue(timeState.playedSeconds);
    }
  }, [timeState.playedSeconds, isDragging]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSliderValue(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsDragging(true);
    updatePlayerInternals({ seeking: true });
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    setSeekPosition(newTime);
    updatePlayerInternals({ seeking: false });
    setIsDragging(false);
    setLocalSliderValue(newTime);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    setSeekPosition(newTime);
    updatePlayerInternals({ seeking: false });
    setIsDragging(false);
    setLocalSliderValue(newTime);
  };

  const sliderValue = isDragging ? localSliderValue : timeState.playedSeconds;
  const maxDuration = timeState.duration > 0 ? timeState.duration : 100;
  const progressPercent = (sliderValue / maxDuration) * 100;
  const isDisabled = maxDuration <= 0 || !isFinite(maxDuration);

  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Progress Slider */}
        <input
          type="range"
          min={0}
          max={maxDuration}
          step={0.1}
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          onTouchStart={handleSeekMouseDown}
          onTouchEnd={handleTouchEnd}
          disabled={isDisabled}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:[&::-webkit-slider-thumb]:bg-muted-foreground"
          style={{
            background: isDisabled
              ? `var(--muted)`
              : `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progressPercent}%, var(--muted) ${progressPercent}%, var(--muted) 100%)`,
          }}
        />

        {/* Time Display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(sliderValue)}</span>
          <span>{formatTime(timeState.duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
