import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Global sound state with immediate access
export let isSoundMuted = false;

// Initialize from localStorage if available (client-side only)
if (typeof window !== "undefined") {
  try {
    const storedMuteState = localStorage.getItem("isSoundMuted");
    if (storedMuteState !== null) {
      isSoundMuted = JSON.parse(storedMuteState) === true;
    }
  } catch (e) {
    console.error("Error reading sound mute state from localStorage", e);
  }
}

// Directly set global mute state
export const setSoundMuted = (muted: boolean): void => {
  isSoundMuted = muted;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("isSoundMuted", JSON.stringify(muted));
    } catch (e) {
      console.error("Error saving sound mute state to localStorage", e);
    }
  }
};

// Track active audio elements by sound type
const activeSounds: Record<string, HTMLAudioElement> = {};
const audioLoadingStates: Record<string, boolean> = {};

// Play a sound with type identification (drag, resize, etc.)
export const playSound = (
  soundPath: string,
  soundType: string = "default"
): HTMLAudioElement | null => {
  try {
    // Check if sound is muted globally
    if (isSoundMuted) {
      return null;
    }

    // Stop previous sound of the same type if it exists
    stopSound(soundType);

    const audio = new Audio(soundPath);

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
export const stopSound = (soundType: string = "default"): void => {
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
