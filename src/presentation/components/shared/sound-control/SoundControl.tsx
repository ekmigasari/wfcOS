"use client";

import { useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import {
  soundVolumeLevelAtom,
  SoundVolumeLevel,
  volumeLevelPercentages,
} from "@/application/atoms/soundAtoms";
import { SoundVolumeSelector } from "./SoundVolumeSelector";
import { setSoundVolumeLevel, playSound } from "@/infrastructure/lib/utils";
import { Card, CardContent } from "@/presentation/components/ui/card";

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
    <Card className="w-full bg-card text-card-foreground border-none shadow-none">
      <CardContent className="p-4 sm:p-6">
        <SoundVolumeSelector
          selectedLevel={tempVolumeLevel}
          onSelect={handleVolumeLevelChange}
        />
      </CardContent>
    </Card>
  );
};

export default SoundControl;
