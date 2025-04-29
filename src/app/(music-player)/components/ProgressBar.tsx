"use client";

import { useState, useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  playerTimeAtom,
  setSeekPositionAtom,
  updatePlayerInternalsAtom,
} from "@/application/atoms/musicPlayerAtom";
import { Slider } from "@/presentation/components/ui/slider";

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
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const [localSliderValue, setLocalSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalSliderValue(timeState.playedSeconds);
    }
  }, [timeState.playedSeconds, isDragging]);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setLocalSliderValue(newValue);

    if (!isDragging) {
      setIsDragging(true);
      updatePlayerInternals({ seeking: true });
    }
  };

  const handleSliderCommit = (values: number[]) => {
    const newValue = values[0];
    setSeekPosition(newValue);
    updatePlayerInternals({ seeking: false });
    setIsDragging(false);
  };

  // Handle direct click on progress bar container
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled || !sliderContainerRef.current) return;

    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = clickX / rect.width;
    const newTime = percentClicked * maxDuration;

    // Update slider value
    setLocalSliderValue(newTime);

    // Seek to position
    setSeekPosition(newTime);

    // Handle seeking state
    updatePlayerInternals({ seeking: true });
    setTimeout(() => {
      updatePlayerInternals({ seeking: false });
    }, 50);
  };

  const sliderValue = isDragging ? localSliderValue : timeState.playedSeconds;
  const maxDuration = timeState.duration > 0 ? timeState.duration : 100;
  const isDisabled = maxDuration <= 0 || !isFinite(maxDuration);

  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Progress Slider Container with click handler */}
        <div
          ref={sliderContainerRef}
          className="relative w-full h-5 cursor-pointer flex items-center"
          onClick={handleProgressBarClick}
        >
          <Slider
            value={[sliderValue]}
            min={0}
            max={maxDuration}
            step={0.1}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            disabled={isDisabled}
            className="w-full absolute z-10 pointer-events-none"
          />
          {/* Invisible overlay to capture clicks */}
          <div className="absolute inset-0 z-20"></div>
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
