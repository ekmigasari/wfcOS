"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  ambienceSounds,
  currentSoundAtom,
} from "@/application/atoms/ambiencePlayerAtom";
import { useAmbienceControls } from "@/application/hooks/useAmbienceControls";

export const TrackInfo = () => {
  const [currentSound] = useAtom(currentSoundAtom);
  const { currentSoundIndex, isLoading, isPlaying } = useAmbienceControls();

  return (
    <div>
      <h3 className="text-lg font-medium text-primary">
        {currentSound?.title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : isPlaying ? "Playing" : "Paused"}
      </p>
      <p className="text-sm text-muted-foreground">
        <span>Sound {currentSoundIndex + 1}</span>
        <span> of {ambienceSounds.length}</span>
      </p>
    </div>
  );
};
