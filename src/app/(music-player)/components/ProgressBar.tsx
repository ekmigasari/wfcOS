"use client";

import { useState, useEffect, useRef } from "react";
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
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  // Handle direct click on progress bar
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = clickX / rect.width;
    const newTime = percentClicked * maxDuration;

    setLocalSliderValue(newTime);
    setSeekPosition(newTime);
    updatePlayerInternals({ seeking: true });

    // Small delay to ensure the seeking state is updated properly
    setTimeout(() => {
      updatePlayerInternals({ seeking: false });
    }, 50);
  };

  const sliderValue = isDragging ? localSliderValue : timeState.playedSeconds;
  const maxDuration = timeState.duration > 0 ? timeState.duration : 100;
  const progressPercent = (sliderValue / maxDuration) * 100;
  const isDisabled = maxDuration <= 0 || !isFinite(maxDuration);

  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Progress Bar Container */}
        <div
          ref={progressBarRef}
          className="relative w-full h-2 bg-muted rounded-full cursor-pointer"
          onClick={handleProgressBarClick}
          style={{
            background: isDisabled
              ? `var(--muted)`
              : `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progressPercent}%, var(--muted) ${progressPercent}%, var(--muted) 100%)`,
          }}
        >
          {/* Slider Input (invisible but functional) */}
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

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
