"use client";

import { useAtom } from "jotai";
import { useCallback,useEffect, useState } from "react";

import {
  SoundVolumeLevel,
  soundVolumeLevelAtom,
  volumeLevelPercentages,
} from "@/application/atoms/soundAtoms";
import { playSound,setSoundVolumeLevel } from "@/infrastructure/lib/utils";

import { SoundVolumeSelector } from "./SoundVolumeSelector";

interface SoundControlProps {
  onSettingsChange: () => void;
  onApplySettings?: (applyFn: () => void) => void;
  onRegisterResetFn?: (resetFn: () => void) => void;
}

export const SoundControl = ({
  onSettingsChange,
  onApplySettings,
  onRegisterResetFn,
}: SoundControlProps) => {
  const [volumeLevel, setVolumeLevel] = useAtom(soundVolumeLevelAtom);

  const [tempVolumeLevel, setTempVolumeLevel] =
    useState<SoundVolumeLevel>(volumeLevel);

  // Function to reset temporary state to global state
  const resetTempState = useCallback(() => {
    setTempVolumeLevel(volumeLevel);
  }, [volumeLevel]);

  // Initialize temp settings when global settings change
  useEffect(() => {
    setTempVolumeLevel(volumeLevel);
  }, [volumeLevel]);

  // Register the reset function with the parent
  useEffect(() => {
    if (onRegisterResetFn) {
      onRegisterResetFn(resetTempState);
    }
  }, [onRegisterResetFn, resetTempState]);

  // Handle volume level selection - Update temp state and play preview sound
  const handleVolumeLevelChange = (level: SoundVolumeLevel) => {
    setTempVolumeLevel(level);
    onSettingsChange();

    // Play preview sound using the selected level's volume, only if not 'mute'
    if (level !== "mute") {
      const previewVolume = volumeLevelPercentages[level] / 100;
      setTimeout(
        () => playSound("/sounds/click.mp3", "preview", previewVolume),
        50
      );
    }
  };

  // Apply the sound settings (Commits temp state to global)
  const applySoundSettings = useCallback(() => {
    // Always update the volume level, including setting it to 'mute'
    setVolumeLevel(tempVolumeLevel);
    setSoundVolumeLevel(tempVolumeLevel); // Update global util state as well
  }, [tempVolumeLevel, setVolumeLevel]);

  // Register the apply function with the parent
  useEffect(() => {
    if (onApplySettings) {
      onApplySettings(applySoundSettings);
    }
  }, [onApplySettings, applySoundSettings]);

  return (
    <div className="w-full">
      <SoundVolumeSelector
        selectedLevel={tempVolumeLevel}
        onSelect={handleVolumeLevelChange}
      />
    </div>
  );
};

export default SoundControl;
