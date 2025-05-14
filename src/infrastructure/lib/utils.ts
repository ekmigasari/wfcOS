import { type ClassValue,clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  SoundVolumeLevel,
  volumeLevelPercentages,
} from "@/application/atoms/soundAtoms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Global sound state with immediate access
export let soundVolumeLevel: SoundVolumeLevel = "medium"; // Default to medium
export let soundVolume = volumeLevelPercentages[soundVolumeLevel] / 100; // Initialize based on level

// Initialize from localStorage if available (client-side only)
if (typeof window !== "undefined") {
  try {
    const storedVolumeLevel = localStorage.getItem("soundVolumeLevel");
    if (storedVolumeLevel !== null) {
      const parsedLevel = JSON.parse(storedVolumeLevel) as SoundVolumeLevel;
      // Validate the stored level against the type
      if (["mute", "low", "medium", "full"].includes(parsedLevel)) {
        soundVolumeLevel = parsedLevel;
        soundVolume = volumeLevelPercentages[soundVolumeLevel] / 100;
      } else {
        // Fallback to default if stored value is invalid
        soundVolume = volumeLevelPercentages.medium / 100;
        localStorage.setItem("soundVolumeLevel", JSON.stringify("medium"));
      }
    }
  } catch (e) {
    console.error("Error reading sound state from localStorage", e);
    // Fallback to default on error
    soundVolumeLevel = "medium";
    soundVolume = volumeLevelPercentages[soundVolumeLevel] / 100;
  }
}

// Directly set global volume level
export const setSoundVolumeLevel = (level: SoundVolumeLevel): void => {
  // Validate level
  if (!["mute", "low", "medium", "full"].includes(level)) {
    console.warn(
      `Invalid sound level provided: ${level}. Defaulting to medium.`
    );
    level = "medium";
  }

  soundVolumeLevel = level;
  soundVolume = volumeLevelPercentages[level] / 100;

  // Only save valid level to storage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("soundVolumeLevel", JSON.stringify(level));
    } catch (e) {
      console.error("Error saving sound volume state to localStorage", e);
    }
  }
};

// Track active audio elements by sound type
const activeSounds: Record<string, HTMLAudioElement> = {};
const audioLoadingStates: Record<string, boolean> = {};

// Play a sound with type identification and optional volume override
export const playSound = (
  soundPath: string,
  soundType = "default",
  volumeOverride?: number // Optional volume override (0.0 to 1.0)
): HTMLAudioElement | null => {
  try {
    // Determine effective volume: override > global > default (1.0)
    const effectiveVolume =
      volumeOverride !== undefined ? volumeOverride : soundVolume;

    // Check if sound level is effectively 'mute' or volume is 0
    if (
      (soundVolumeLevel === "mute" && volumeOverride === undefined) ||
      effectiveVolume <= 0
    ) {
      // Don't play if globally muted (and no override) OR if effective volume is zero
      return null;
    }

    // Stop previous sound of the same type if it exists
    stopSound(soundType);

    const audio = new Audio(soundPath);

    // Apply the effective volume level
    audio.volume = effectiveVolume;

    // Set loading state
    audioLoadingStates[soundType] = true;

    // Add event listeners to track audio state
    audio.addEventListener("canplaythrough", () => {
      audioLoadingStates[soundType] = false;
    });

    audio.addEventListener("error", () => {
      delete activeSounds[soundType];
      delete audioLoadingStates[soundType];
    });

    // Store the audio element before playing
    activeSounds[soundType] = audio;

    // Play with error handling
    const playPromise = audio.play();

    // Handle play promise to avoid interruption errors
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error playing sound";
        console.error(`Error playing sound: ${errorMessage}`);
        delete activeSounds[soundType];
        delete audioLoadingStates[soundType];
      });
    }

    return audio;
  } catch (error) {
    console.error(`Error creating sound: ${soundPath}`, error);
    return null;
  }
};

// Stop a sound by type, with safe pause handling
export const stopSound = (soundType = "default"): void => {
  const audio = activeSounds[soundType];

  if (!audio) return;

  try {
    // Only attempt to pause if we're no longer loading
    if (!audioLoadingStates[soundType]) {
      audio.pause();
    }

    // Reset audio state
    audio.currentTime = 0;

    // Clean up
    delete activeSounds[soundType];
    delete audioLoadingStates[soundType];
  } catch (e) {
    const error = e as Error;
    console.error(`Error stopping sound: ${error.message}`);
  }
};

// Stop all sounds
export const stopAllSounds = (): void => {
  Object.keys(activeSounds).forEach((soundType) => {
    stopSound(soundType);
  });
};
