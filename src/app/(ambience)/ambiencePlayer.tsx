"use client";

import React from "react";
import { AmbiencePlayerUI } from "./ambiencePlayerUI";
import { playSound } from "@/infrastructure/lib/utils";
import { useAmbienceAudio } from "@/application/hooks";

/**
 * AmbiencePlayer
 *
 * UI component for the ambience player that handles user interactions
 * and manages its own audio playback state via the useAmbienceAudio hook.
 */
export const AmbiencePlayer: React.FC = () => {
  // Use the dedicated hook for audio state and controls
  const {
    currentSound,
    isPlaying,
    volume,
    // isMuted is handled internally by the hook via toggleMute/changeVolume
    isLoading,
    togglePlayPause,
    nextTrack,
    previousTrack,
    changeVolume,
    toggleMute,
  } = useAmbienceAudio();

  // Simple UI sound player wrappers
  const playUISound = (action: () => void) => {
    setTimeout(() => playSound("/sounds/click.mp3"), 10);
    action();
  };

  // Pass state and handlers to the UI component
  return (
    <AmbiencePlayerUI
      currentSound={currentSound}
      isPlaying={isPlaying}
      isLoading={isLoading} // Pass loading state to UI
      volume={volume}
      onPlayPause={() => playUISound(togglePlayPause)}
      onPrevious={() => playUISound(previousTrack)}
      onNext={() => playUISound(nextTrack)}
      onVolumeChange={changeVolume} // Direct pass-through, hook handles mute logic
      onMuteToggle={() => playUISound(toggleMute)}
    />
  );
};
