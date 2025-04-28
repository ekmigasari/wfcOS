"use client";

import React from "react";
import { useAmbiencePlayer } from "@/application/hooks/useAmbiencePlayer";
import { ambienceSounds } from "@/application/atoms/ambiencePlayerAtom";
import { playSound } from "@/infrastructure/lib/utils";

// Icons
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

// UI Components
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";

const AmbiencePlayer: React.FC = () => {
  const {
    currentSound,
    currentSoundIndex,
    isPlaying,
    volume,
    isMuted,
    isLoading,
    isWindowOpen,
    playPause,
    next,
    previous,
    changeVolume,
    toggleMute,
  } = useAmbiencePlayer();

  // Event handlers with sound effects
  const handlePlayPause = () => {
    playSound("/sounds/click.mp3");
    playPause();
  };

  const handleNext = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;
    playSound("/sounds/click.mp3");
    next();
  };

  const handlePrevious = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;
    playSound("/sounds/click.mp3");
    previous();
  };

  const handleVolumeChange = (value: number[]) => {
    changeVolume(value);
  };

  const handleToggleMute = () => {
    playSound("/sounds/click.mp3");
    toggleMute();
  };

  return (
    <div className="flex flex-col h-full p-3 bg-stone-100">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-primary">
            {currentSound?.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : isPlaying ? "Playing" : "Paused"}
            {!isWindowOpen && isPlaying && " in background"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span>Sound {currentSoundIndex + 1}</span>
            <span> of {ambienceSounds.length}</span>
          </p>
        </div>

        <div className="flex justify-center items-center space-x-3">
          <div className="p-1 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={isLoading}
              className="h-10 w-10 rounded-full"
            >
              <SkipBack size={20} />
            </Button>
          </div>

          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`h-14 w-14 rounded-full ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </Button>

          <div className="p-1 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={isLoading}
              className="h-10 w-10 rounded-full"
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleMute}
          className="h-8 w-8 rounded-full"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />

        <span className="text-xs text-muted-foreground w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default AmbiencePlayer;
