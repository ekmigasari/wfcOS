"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useAmbienceControls } from "@/application/hooks/useAmbienceControls";

export const PlayerControls = () => {
  const { isPlaying, isLoading, handlePlayPause, handleNext, handlePrevious } =
    useAmbienceControls();

  return (
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
        className={`h-14 w-14 rounded-full ${isLoading ? "opacity-70" : ""}`}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
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
  );
};
