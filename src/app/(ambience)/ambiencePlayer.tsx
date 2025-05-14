"use client";

import React from "react";

import { useAmbienceAudio } from "@/application/hooks";
import { playSound } from "@/infrastructure/lib/utils";

import { AmbiencePlayerUI } from "./ambiencePlayerUI";

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

  // Enhanced track controls that maintain playback state
  const handleNextTrack = () => {
    playUISound(() => {
      nextTrack();
      // No need to explicitly start playback as the hook should maintain state
    });
  };

  const handlePreviousTrack = () => {
    playUISound(() => {
      previousTrack();
      // No need to explicitly start playback as the hook should maintain state
    });
  };

  // Pass state and handlers to the UI component
  return (
    <AmbiencePlayerUI
      currentSound={currentSound}
      isPlaying={isPlaying}
      isLoading={isLoading} // Pass loading state to UI
      volume={volume}
      onPlayPause={() => playUISound(togglePlayPause)}
      onPrevious={handlePreviousTrack}
      onNext={handleNextTrack}
      onVolumeChange={changeVolume} // Direct pass-through, hook handles mute logic
      onMuteToggle={() => playUISound(toggleMute)}
    />
  );
};
