import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to play a sound and return the Audio object
export const playSound = (soundPath: string): HTMLAudioElement | null => {
  try {
    const audio = new Audio(soundPath);
    audio.play();
    return audio; // Return the audio object
  } catch (error) {
    console.error(`Error playing sound: ${soundPath}`, error);
    return null; // Return null on error
  }
};
