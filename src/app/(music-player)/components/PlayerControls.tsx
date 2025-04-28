"use client";

import React from "react";
import { useAtom } from "jotai";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { musicPlayerAtom } from "@/application/atoms/musicPlayerAtom";

interface PlayerControlsProps {
  handlePrevious: () => void;
  handlePlayPause: () => void;
  handleNext: () => void;
}

export const PlayerControls = ({
  handlePrevious,
  handlePlayPause,
  handleNext,
}: PlayerControlsProps) => {
  // Read state from atom
  const [state] = useAtom(musicPlayerAtom);
  const { playlist, isPlaying } = state;

  return (
    <div className="flex justify-center items-center space-x-4 mb-4">
      <button
        onClick={handlePrevious}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        aria-label="Previous"
        disabled={playlist.length <= 1}
      >
        <SkipBack className="w-5 h-5" />
      </button>
      <button
        onClick={handlePlayPause}
        className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={playlist.length === 0}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>
      <button
        onClick={handleNext}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        aria-label="Next"
        disabled={playlist.length <= 1}
      >
        <SkipForward className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PlayerControls;
