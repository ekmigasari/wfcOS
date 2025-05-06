"use client";

import { useAtom } from "jotai";
import { Volume2, VolumeX, Volume1, Volume } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import {
  soundVolumeLevelAtom,
  SoundVolumeLevel,
} from "@/application/atoms/soundAtoms";
import { playSound, setSoundVolumeLevel } from "@/infrastructure/lib/utils";

// Define the order of volume levels for cycling
const volumeCycle: SoundVolumeLevel[] = ["mute", "low", "medium", "full"];

export const SoundToggle = () => {
  // Only need the volume level atom
  const [volumeLevel, setVolumeLevel] = useAtom(soundVolumeLevelAtom);

  const cycleVolume = () => {
    const currentIndex = volumeCycle.indexOf(volumeLevel);
    // Determine the next index, wrapping around
    const nextIndex = (currentIndex + 1) % volumeCycle.length;
    const nextLevel = volumeCycle[nextIndex];

    // Update the atom state
    setVolumeLevel(nextLevel);

    // Update the global util state for immediate effect
    setSoundVolumeLevel(nextLevel);

    // Play a click sound, except when transitioning to 'mute'
    if (nextLevel !== "mute") {
      setTimeout(() => {
        playSound("/sounds/click.mp3", "toggle");
      }, 50); // Reduced timeout slightly
    }
  };

  // Determine icon based on the current volumeLevel
  const getVolumeIcon = () => {
    switch (volumeLevel) {
      case "mute":
        return <VolumeX size={16} />;
      case "low":
        return <Volume size={16} />;
      case "medium":
        return <Volume1 size={16} />;
      case "full":
        return <Volume2 size={16} />;
      default:
        return <Volume2 size={16} />; // Default icon
    }
  };

  // Generate tooltip based on the *next* state
  const getTooltip = () => {
    const currentIndex = volumeCycle.indexOf(volumeLevel);
    const nextIndex = (currentIndex + 1) % volumeCycle.length;
    const nextLevel = volumeCycle[nextIndex];
    switch (nextLevel) {
      case "mute":
        return "Mute sound";
      case "low":
        return "Set sound to Low";
      case "medium":
        return "Set sound to Medium";
      case "full":
        return "Set sound to Full";
      default:
        return "Toggle sound";
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={cycleVolume}
      title={getTooltip()} // Use dynamic tooltip
    >
      {getVolumeIcon()}
    </Button>
  );
};
