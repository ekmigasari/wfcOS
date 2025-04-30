"use client";

import React, { useRef } from "react";
import { useAtom } from "jotai";
import {
  currentSoundAtom,
  isPlayingAtom,
  volumeAtom,
  ambiencePlayerActions,
} from "@/application/atoms/ambiencePlayerAtom";
import { AmbiencePlayerUI } from "./ambiencePlayerUI";
import { playSound } from "@/infrastructure/lib/utils";

/**
 * AmbiencePlayer
 *
 * UI component for the ambience player that handles user interactions.
 * The actual audio playback is managed by the GlobalAmbienceManager.
 */
export const AmbiencePlayer: React.FC = () => {


  // Player state
  const [currentSound] = useAtom(currentSoundAtom);
  const [isPlaying] = useAtom(isPlayingAtom);
  const [volume] = useAtom(volumeAtom);
  const [, dispatchAction] = useAtom(ambiencePlayerActions);

  // Track previous volume for mute toggle
  const previousVolumeRef = useRef<number>(volume);

  // Player control handlers
  const handlePlayPause = () => {
    // Play UI sound with small delay to avoid audio conflicts
    setTimeout(() => playSound("/sounds/click.mp3"), 10);
    dispatchAction({ type: "toggle" });
  };

  const handlePrevious = () => {
    setTimeout(() => playSound("/sounds/click.mp3"), 10);
    dispatchAction({ type: "previous" });
  };

  const handleNext = () => {
    setTimeout(() => playSound("/sounds/click.mp3"), 10);
    dispatchAction({ type: "next" });
  };

  const handleVolumeChange = (newVolume: number) => {
    dispatchAction({ type: "setVolume", payload: newVolume });
  };

  const handleMuteToggle = () => {
    setTimeout(() => playSound("/sounds/click.mp3"), 10);
    if (volume > 0) {
      previousVolumeRef.current = volume;
      dispatchAction({ type: "setVolume", payload: 0 });
    } else {
      dispatchAction({
        type: "setVolume",
        payload:
          previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.7,
      });
    }
  };

  return (
    <AmbiencePlayerUI
      currentSound={currentSound}
      isPlaying={isPlaying}
      volume={volume}
      onPlayPause={handlePlayPause}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onVolumeChange={handleVolumeChange}
      onMuteToggle={handleMuteToggle}
    />
  );
};
