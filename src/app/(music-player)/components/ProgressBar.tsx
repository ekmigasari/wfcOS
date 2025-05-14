"use client";

import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef,useState } from "react";

import {
  playerTimeAtom,
  setSeekPositionAtom,
  updatePlayerInternalsAtom,
} from "@/application/atoms/musicPlayerAtom";
import { cn } from "@/infrastructure/lib/utils";
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [localSliderValue, setLocalSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    time: number;
  }>({ x: 0, time: 0 });

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

    // Update the seek position immediately during drag for optimistic updates
    // This makes the slider follow the mouse in real-time
    updatePlayerInternals({
      playedSeconds: newValue,
      currentTime: newValue,
    });
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

  // Handle mouse move to show tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderContainerRef.current || isDisabled) return;

    const rect = sliderContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentX = Math.max(0, Math.min(1, mouseX / rect.width));
    const hoverTime = percentX * maxDuration;

    setHoverPosition({
      x: mouseX,
      time: hoverTime,
    });

    if (!isHovering) {
      setIsHovering(true);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const sliderValue = isDragging ? localSliderValue : timeState.playedSeconds;
  const maxDuration = timeState.duration > 0 ? timeState.duration : 100;
  const isDisabled = maxDuration <= 0 || !isFinite(maxDuration);

  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Progress Slider Container with hover and click handlers */}
        <div
          ref={sliderContainerRef}
          className="relative w-full h-5 cursor-pointer flex items-center"
          onClick={handleProgressBarClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <style jsx global>{`
            [data-slot="slider-thumb"] {
              transition: transform 0.1s ease;
              will-change: transform;
            }

            ${isDragging
              ? `
              [data-slot="slider-thumb"] {
                transform: scale(1.2);
                box-shadow: 0 0 0 4px rgba(var(--color-primary), 0.15);
                cursor: grabbing !important;
              }
              
              [data-slot="slider-range"] {
                transition: none !important;
              }
            `
              : ""}

            .time-tooltip {
              position: absolute;
              background-color: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              transform: translateX(-50%) translateY(-130%);
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.15s ease;
              white-space: nowrap;
              z-index: 30;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .time-tooltip.visible {
              opacity: 1;
            }

            .time-tooltip:after {
              content: "";
              position: absolute;
              bottom: -4px;
              left: 50%;
              margin-left: -4px;
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 4px solid hsl(var(--primary));
            }
          `}</style>

          <Slider
            value={[sliderValue]}
            min={0}
            max={maxDuration}
            step={0.1}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            disabled={isDisabled}
            className={cn(
              "w-full absolute z-10",
              isDragging ? "pointer-events-auto" : "pointer-events-none"
            )}
          />

          {/* Time tooltip */}
          <div
            ref={tooltipRef}
            className={cn(
              "time-tooltip",
              (isHovering || isDragging) && "visible"
            )}
            style={{
              left: `${hoverPosition.x}px`,
            }}
          >
            {formatTime(hoverPosition.time)}
          </div>

          {/* Invisible overlay to capture clicks */}
          <div
            className={cn(
              "absolute inset-0 z-20",
              isDragging && "pointer-events-none"
            )}
          ></div>
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
