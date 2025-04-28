// Global audio service for ambience player
"use client";

// Flag to track if we're in a page unload state
let isPageUnloading = false;

// Create a global audio element to ensure playback continues when needed
let globalAudio: HTMLAudioElement | null = null;

// Set up beforeunload handler to prevent zombie audio
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isPageUnloading = true;
    if (globalAudio) {
      // Stop any playing audio when the page is about to unload
      try {
        globalAudio.pause();
        globalAudio.src = "";
      } catch (e) {
        console.error("Error stopping audio on page unload:", e);
      }
    }
  });
}

// Queue for audio operations to prevent race conditions
type AudioOperation = {
  type: "play" | "pause" | "load" | "setSource" | "setCurrentTime";
  payload?: string | number;
};

const audioOperationQueue: AudioOperation[] = [];
let isProcessingQueue = false;

// Process the audio operation queue
const processAudioQueue = async () => {
  if (isProcessingQueue || !globalAudio || audioOperationQueue.length === 0)
    return;

  isProcessingQueue = true;

  while (audioOperationQueue.length > 0) {
    const operation = audioOperationQueue.shift();
    if (!operation) continue;

    try {
      switch (operation.type) {
        case "play":
          await globalAudio.play();
          break;
        case "pause":
          globalAudio.pause();
          break;
        case "load":
          globalAudio.load();
          break;
        case "setSource":
          if (operation.payload && typeof operation.payload === "string") {
            globalAudio.src = operation.payload;
          }
          break;
        case "setCurrentTime":
          if (
            operation.payload !== undefined &&
            typeof operation.payload === "number"
          ) {
            globalAudio.currentTime = operation.payload;
          }
          break;
      }
    } catch (error) {
      console.error(
        `Error performing audio operation ${operation.type}:`,
        error
      );
    }

    // Small delay to prevent browser throttling
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  isProcessingQueue = false;
};

// Safe wrappers for audio operations
export const safeAudioPlay = () => {
  if (!globalAudio || isPageUnloading)
    return Promise.reject(new Error("No audio element or page is unloading"));
  audioOperationQueue.push({ type: "play" });
  processAudioQueue();
  return Promise.resolve();
};

export const safeAudioPause = () => {
  if (!globalAudio || isPageUnloading) return;
  audioOperationQueue.push({ type: "pause" });
  processAudioQueue();
};

export const safeAudioLoad = () => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "load" });
  processAudioQueue();
};

export const safeAudioSetSource = (source: string) => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "setSource", payload: source });
  processAudioQueue();
};

export const safeAudioSetCurrentTime = (time: number) => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "setCurrentTime", payload: time });
  processAudioQueue();
};

export const safeAudioSetVolume = (volume: number) => {
  if (!globalAudio) return;
  globalAudio.volume = volume;
};

export const getAudioCurrentTime = (): number => {
  if (!globalAudio) return 0;
  return globalAudio.currentTime;
};

export const isAudioPlaying = (): boolean => {
  if (!globalAudio) return false;
  return !globalAudio.paused && !globalAudio.ended;
};

export const initializeAudio = () => {
  if (typeof window !== "undefined" && !globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
  }
};

export const cleanupAudio = (shouldPause: boolean = true) => {
  if (!globalAudio) return;

  if (shouldPause) {
    safeAudioPause();
  }

  if (isPageUnloading) {
    try {
      globalAudio.pause();
      globalAudio.src = ""; // Releases media resources
      globalAudio.load(); // Force cleanup
    } catch (e) {
      console.error("Error during final cleanup:", e);
    }
  }
};

// Full stop and cleanup for when window is closed (not just minimized)
export const stopAudio = () => {
  if (!globalAudio) return;

  try {
    safeAudioPause();
    globalAudio.src = ""; // Releases media resources
    globalAudio.load(); // Force cleanup
    console.log("Audio fully stopped and cleaned up");
  } catch (e) {
    console.error("Error during audio stop:", e);
  }
};

export const getAudioElement = () => globalAudio;
export const getIsPageUnloading = () => isPageUnloading;
