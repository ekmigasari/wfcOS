"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  ambienceSounds,
  currentSoundIndexAtom,
  isPlayingAtom,
  volumeAtom,
  persistAmbiencePlayerState,
  currentSoundAtom,
  isWindowOpenAtom,
  currentTimeAtom,
} from "../../application/atoms/ambiencePlayerAtom";
import { playSound } from "@/infrastructure/lib/utils";

// Icons
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

// UI Components
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";

// Create a global audio element to ensure playback continues when window is closed
let globalAudio: HTMLAudioElement | null = null;

// Flag to track if we're in a page unload state
let isPageUnloading = false;

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
const safeAudioPlay = () => {
  if (!globalAudio || isPageUnloading)
    return Promise.reject(new Error("No audio element or page is unloading"));
  audioOperationQueue.push({ type: "play" });
  processAudioQueue();
  return Promise.resolve();
};

const safeAudioPause = () => {
  if (!globalAudio || isPageUnloading) return;
  audioOperationQueue.push({ type: "pause" });
  processAudioQueue();
};

const safeAudioLoad = () => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "load" });
  processAudioQueue();
};

const safeAudioSetSource = (source: string) => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "setSource", payload: source });
  processAudioQueue();
};

const safeAudioSetCurrentTime = (time: number) => {
  if (!globalAudio) return;
  audioOperationQueue.push({ type: "setCurrentTime", payload: time });
  processAudioQueue();
};

if (typeof window !== "undefined" && !globalAudio) {
  globalAudio = new Audio();
  globalAudio.loop = true;
}

const AmbiencePlayer: React.FC = () => {
  // Global state using Jotai atoms
  const [currentSoundIndex, setCurrentSoundIndex] = useAtom(
    currentSoundIndexAtom
  );
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [currentSound] = useAtom(currentSoundAtom);
  const [isWindowOpen, setIsWindowOpen] = useAtom(isWindowOpenAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [, persistState] = useAtom(persistAmbiencePlayerState);

  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isLoading, setIsLoading] = useState(false);
  const initialSyncDone = useRef(false);
  const ignoreEvents = useRef(false);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Set up audio element - run only once
  useEffect(() => {
    if (!globalAudio) return;

    // Set initial volume
    globalAudio.volume = volume;

    return () => {
      // Clean up function - do not pause or stop the audio
      // to allow background playback
    };
  }, [volume]);

  // Initial sync on component mount
  useEffect(() => {
    const syncPlaybackState = async () => {
      if (
        !globalAudio ||
        !currentSound ||
        initialSyncDone.current ||
        isPageUnloading
      )
        return;
      initialSyncDone.current = true;

      console.log("Syncing initial playback state...");
      ignoreEvents.current = true;

      // Force a short pause before sync to let the system stabilize
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check if we need to load the sound
      const currentUrl = globalAudio.src || "";
      const shouldLoad = !currentUrl.endsWith(currentSound.source);
      let needsTimeUpdate = true;

      // If we need to load a new sound
      if (shouldLoad) {
        console.log(`Loading sound: ${currentSound.title}`);
        setIsLoading(true);

        // Ensure audio is paused before changing source
        if (!globalAudio.paused) {
          safeAudioPause();
          // Give it a moment to properly pause
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        safeAudioSetSource(currentSound.source);
        safeAudioLoad();
      } else {
        // If the correct sound is already loaded, we might need to check
        // if the current play position is close to our saved position
        // This is crucial for resuming the sound at the right position
        needsTimeUpdate = Math.abs(globalAudio.currentTime - currentTime) > 2;
      }

      // Sync volume
      globalAudio.volume = volume;

      // Set up the canplaythrough event to handle setting the current time and playing
      const handleCanPlayThrough = () => {
        // Check if we need to update the current time
        if (needsTimeUpdate && currentTime > 0) {
          console.log(`Restoring playback position to ${currentTime} seconds`);
          try {
            // Don't try to set currentTime beyond duration
            if (globalAudio.duration && currentTime < globalAudio.duration) {
              safeAudioSetCurrentTime(currentTime);
            } else {
              console.warn(
                "Saved time exceeds audio duration, starting from beginning"
              );
            }
          } catch (error) {
            console.error("Error setting currentTime:", error);
          }
        }

        // Start playback if needed
        if (isPlaying) {
          safeAudioPlay().catch((error) => {
            console.error("Failed to play after setting position:", error);
            setIsPlaying(false);
            persistState({ isPlaying: false });
          });
        }

        // Clean up this one-time event handler
        globalAudio.removeEventListener("canplaythrough", handleCanPlayThrough);
        setIsLoading(false);
        ignoreEvents.current = false;
      };

      // Add one-time event listener for when audio is ready
      globalAudio.addEventListener("canplaythrough", handleCanPlayThrough);

      // If we didn't need to load a new sound and it's already ready to play
      // we might not get the canplaythrough event, so handle it manually
      if (!shouldLoad && globalAudio.readyState >= 3) {
        console.log("Audio already ready, syncing position immediately");
        handleCanPlayThrough();
        globalAudio.removeEventListener("canplaythrough", handleCanPlayThrough);
      }
    };

    syncPlaybackState();
  }, [
    currentSound,
    isPlaying,
    volume,
    persistState,
    currentTime,
    setIsPlaying,
  ]);

  // Mark window as open when component mounts
  useEffect(() => {
    setIsWindowOpen(true);
    persistState({ isWindowOpen: true });

    // Mark window as closed when component unmounts
    return () => {
      setIsWindowOpen(false);
      persistState({ isWindowOpen: false });
      // Don't stop playback on unmount - audio will continue in background
    };
  }, [setIsWindowOpen, persistState]);

  // Setup audio event listeners
  useEffect(() => {
    if (!globalAudio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying && !ignoreEvents.current) {
        // Set a small delay to avoid race conditions
        setTimeout(() => {
          if (isPlaying && !ignoreEvents.current) {
            safeAudioPlay().catch((error) => {
              console.error("Error playing sound:", error);
              setIsPlaying(false);
              persistState({ isPlaying: false });
            });
          }
        }, 100);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handlePlay = () => {
      if (!isPlaying && !ignoreEvents.current) {
        console.log("Audio started playing - updating UI state");
        ignoreEvents.current = true;
        setIsPlaying(true);
        persistState({ isPlaying: true });
        setTimeout(() => {
          ignoreEvents.current = false;
        }, 100);
      }
    };

    const handlePause = () => {
      if (isPlaying && !ignoreEvents.current) {
        console.log("Audio was paused - updating UI state");
        ignoreEvents.current = true;
        setIsPlaying(false);
        persistState({ isPlaying: false });
        setTimeout(() => {
          ignoreEvents.current = false;
        }, 100);
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      persistState({ isPlaying: false });
    };

    globalAudio.addEventListener("canplay", handleCanPlay);
    globalAudio.addEventListener("loadstart", handleLoadStart);
    globalAudio.addEventListener("play", handlePlay);
    globalAudio.addEventListener("pause", handlePause);
    globalAudio.addEventListener("error", handleError);

    return () => {
      globalAudio?.removeEventListener("canplay", handleCanPlay);
      globalAudio?.removeEventListener("loadstart", handleLoadStart);
      globalAudio?.removeEventListener("play", handlePlay);
      globalAudio?.removeEventListener("pause", handlePause);
      globalAudio?.removeEventListener("error", handleError);
    };
  }, [isPlaying, persistState, setIsPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!globalAudio) return;
    globalAudio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!globalAudio || ignoreEvents.current || isPageUnloading) return;

    // Check if the actual audio state matches what we expect
    const audioIsActuallyPlaying = !globalAudio.paused && !globalAudio.ended;

    // Detect state mismatch without triggering events
    if (isPlaying !== audioIsActuallyPlaying) {
      console.log(
        `State mismatch detected - UI: ${
          isPlaying ? "playing" : "paused"
        }, Audio: ${audioIsActuallyPlaying ? "playing" : "paused"}`
      );

      if (isPlaying && !audioIsActuallyPlaying && !isLoading) {
        // UI thinks we should be playing, but we're not
        ignoreEvents.current = true;
        console.log("Starting playback to match UI state");
        safeAudioPlay()
          .catch((error) => {
            console.error("Error playing sound:", error);
            setIsPlaying(false);
            persistState({ isPlaying: false });
          })
          .finally(() => {
            setTimeout(() => {
              ignoreEvents.current = false;
            }, 100);
          });
      } else if (!isPlaying && audioIsActuallyPlaying) {
        // UI thinks we should be paused, but we're playing
        ignoreEvents.current = true;
        console.log("Pausing to match UI state");
        safeAudioPause();
        setTimeout(() => {
          ignoreEvents.current = false;
        }, 100);
      }
    }
  }, [isPlaying, isLoading, persistState, setIsPlaying]);

  // Handle track changes when currentSoundIndex changes
  useEffect(() => {
    if (!globalAudio || !currentSound || ignoreEvents.current) return;

    console.log(`Changing track to ${currentSound.title}`);
    ignoreEvents.current = true;

    // Pause current audio before loading new track
    const wasPlaying = !globalAudio.paused && !globalAudio.ended;
    safeAudioPause();

    // Set loading state
    setIsLoading(true);

    // Reset current time since we're changing tracks
    setCurrentTime(0);
    persistState({ currentTime: 0 });

    // Load new track
    safeAudioSetSource(currentSound.source);
    safeAudioLoad();

    // Resume playing if it was playing before
    if (wasPlaying) {
      setTimeout(() => {
        safeAudioPlay().catch((error) => {
          console.error("Error playing new track:", error);
          setIsPlaying(false);
          persistState({ isPlaying: false });
        });
        ignoreEvents.current = false;
      }, 100);
    } else {
      ignoreEvents.current = false;
    }
  }, [
    currentSound,
    currentSoundIndex,
    persistState,
    setIsPlaying,
    setCurrentTime,
  ]);

  // Set up position tracking interval
  useEffect(() => {
    if (!globalAudio) return;

    // Save current position function
    const saveCurrentPosition = () => {
      if (globalAudio && !isLoading) {
        const newTime = globalAudio.currentTime;
        // Only save if position has changed significantly (> 1 second)
        if (Math.abs(newTime - currentTime) > 1) {
          console.log(`Saving current position: ${newTime} seconds`);
          setCurrentTime(newTime);
          persistState({ currentTime: newTime });
        }
      }
    };

    // Set up an interval to periodically save the current playback position
    timeUpdateInterval.current = setInterval(() => {
      if (isPlaying && !globalAudio.paused) {
        saveCurrentPosition();
      }
    }, 5000); // Save position every 5 seconds

    // Also listen for pause/stop events to save position
    const handlePause = () => {
      saveCurrentPosition();
    };

    const handleEnded = () => {
      saveCurrentPosition();
    };

    // Add event listeners for pause and ended events
    globalAudio.addEventListener("pause", handlePause);
    globalAudio.addEventListener("ended", handleEnded);

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }

      // Remove event listeners
      globalAudio?.removeEventListener("pause", handlePause);
      globalAudio?.removeEventListener("ended", handleEnded);

      // Save one last time on unmount
      if (globalAudio) {
        saveCurrentPosition();
      }
    };
  }, [isPlaying, isLoading, currentTime, setCurrentTime, persistState]);

  // Component mount/unmount
  useEffect(() => {
    // Set up visibilitychange listener to detect tab switches
    const handleVisibilityChange = () => {
      // If the page becomes hidden (e.g., switched tabs)
      if (document.visibilityState === "hidden" && !isWindowOpen) {
        // Save the current state
        if (globalAudio) {
          const newTime = globalAudio.currentTime;
          setCurrentTime(newTime);
          persistState({ currentTime: newTime });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // If we're unloading the page (not just closing the window)
      if (isPageUnloading && globalAudio) {
        try {
          // Stop any playing audio and clear source
          globalAudio.pause();
          globalAudio.src = ""; // Releases media resources
          globalAudio.load(); // Force cleanup
        } catch (e) {
          console.error("Error during final cleanup:", e);
        }
      }
    };
  }, [isWindowOpen, persistState, setCurrentTime]);

  // Handlers
  const handlePlayPause = () => {
    playSound("/sounds/click.mp3");
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    persistState({ isPlaying: newPlayingState });
  };

  const handleNext = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;

    playSound("/sounds/click.mp3");

    // Set loading state before changing track
    setIsLoading(true);

    const newIndex = (currentSoundIndex + 1) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const handlePrevious = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;

    playSound("/sounds/click.mp3");

    // Set loading state before changing track
    setIsLoading(true);

    const newIndex =
      (currentSoundIndex - 1 + ambienceSounds.length) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    persistState({ volume: newVolume });
  };

  const toggleMute = () => {
    playSound("/sounds/click.mp3");
    if (isMuted) {
      // Unmute
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.5);
      persistState({ volume: prevVolume > 0 ? prevVolume : 0.5 });
    } else {
      // Mute
      setPrevVolume(volume);
      setIsMuted(true);
      persistState({ volume });
    }
  };

  return (
    <div className="flex flex-col h-full p-3 bg-stone-100">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-primary">
            {currentSound?.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : isPlaying ? "Playing" : "Paused"}
            {!isWindowOpen && isPlaying && " in background"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span>Sound {currentSoundIndex + 1}</span>
            <span> of {ambienceSounds.length}</span>
          </p>
        </div>

        <div className="flex justify-center items-center space-x-3">
          <div className="p-1 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={isLoading}
              className="h-10 w-10 rounded-full"
            >
              <SkipBack size={20} />
            </Button>
          </div>

          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`h-14 w-14 rounded-full ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </Button>

          <div className="p-1 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={isLoading}
              className="h-10 w-10 rounded-full"
            >
              <SkipForward size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="h-8 w-8 rounded-full"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />

        <span className="text-xs text-muted-foreground w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default AmbiencePlayer;
