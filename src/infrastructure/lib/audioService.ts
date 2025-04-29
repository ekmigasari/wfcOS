"use client";

// Create an audio element to handle playback
let globalAudio: HTMLAudioElement | null = null;

// Initialize the audio service
export const initializeAudio = () => {
  if (typeof window !== "undefined" && !globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
  }
};

// Basic audio controls
export const playAudio = async () => {
  if (!globalAudio)
    return Promise.reject(new Error("No audio element initialized"));
  try {
    return await globalAudio.play();
  } catch (error) {
    console.error("Error playing audio:", error);
    return Promise.reject(error);
  }
};

export const pauseAudio = () => {
  if (!globalAudio) return;
  globalAudio.pause();
};

export const setAudioSource = (source: string) => {
  if (!globalAudio) return;
  globalAudio.src = source;
};

export const setAudioVolume = (volume: number) => {
  if (!globalAudio) return;
  globalAudio.volume = Math.max(0, Math.min(1, volume));
};

export const getAudioCurrentTime = (): number => {
  if (!globalAudio) return 0;
  return globalAudio.currentTime;
};

export const setAudioCurrentTime = (time: number) => {
  if (!globalAudio) return;
  globalAudio.currentTime = time;
};

export const isAudioPlaying = (): boolean => {
  if (!globalAudio) return false;
  return !globalAudio.paused && !globalAudio.ended;
};

// Stop audio and clean up resources
export const stopAudio = () => {
  if (!globalAudio) return;

  try {
    globalAudio.pause();
    globalAudio.src = "";
    globalAudio.load();
    console.log("Audio stopped and cleaned up");
  } catch (e) {
    console.error("Error during audio stop:", e);
  }
};

// Get the audio element (for advanced controls if needed)
export const getAudioElement = () => globalAudio;
