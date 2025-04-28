"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import {
  musicPlayerAtom,
  setSeekPositionAtom,
} from "@/application/atoms/musicPlayerAtom";

// Helper to format time (MM:SS)
const formatTime = (seconds: number) => {
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
  const [playerState] = useAtom(musicPlayerAtom);
  const [, setSeekPosition] = useAtom(setSeekPositionAtom);
  const [seeking, setSeeking] = useState(false);
  const [localPosition, setLocalPosition] = useState(0);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setLocalPosition(newTime);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    setSeekPosition(newTime);
  };

  return (
    <div className="mb-2 w-full">
      <div className="flex flex-col space-y-1 w-full">
        {/* Progress Slider */}
        <input
          type="range"
          min={0}
          max={playerState.duration || 100}
          step={0.1}
          value={seeking ? localPosition : playerState.playedSeconds}
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          onTouchStart={handleSeekMouseDown}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onTouchEnd={handleSeekMouseUp as any}
          disabled={
            playerState.playlist.length === 0 || playerState.duration === 0
          }
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
              ((seeking ? localPosition : playerState.playedSeconds) /
                (playerState.duration || 100)) *
              100
            }%, var(--muted) ${
              ((seeking ? localPosition : playerState.playedSeconds) /
                (playerState.duration || 100)) *
              100
            }%, var(--muted) 100%)`,
          }}
        />

        {/* Time Display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(playerState.playedSeconds)}</span>
          <span>{formatTime(playerState.duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
