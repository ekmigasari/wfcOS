"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import {
  currentSoundIndexAtom,
  isPlayingAtom,
  volumeAtom,
  persistAmbiencePlayerState,
  currentSoundAtom,
  isWindowOpenAtom,
  currentTimeAtom,
} from "../atoms/ambiencePlayerAtom";
import {
  initializeAudio,
  safeAudioPlay,
  safeAudioPause,
  safeAudioLoad,
  safeAudioSetSource,
  safeAudioSetCurrentTime,
  safeAudioSetVolume,
  getAudioElement,
  getAudioCurrentTime,
  isAudioPlaying,
  // cleanupAudio,
  stopAudio,
  getIsPageUnloading,
} from "@/infrastructure/lib/audioService";

export const useAmbiencePlayer = () => {
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

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
    const audioElement = getAudioElement();
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume]);

  // Initial sync on component mount
  useEffect(() => {
    const syncPlaybackState = async () => {
      const audioElement = getAudioElement();
      if (
        !audioElement ||
        !currentSound ||
        initialSyncDone.current ||
        getIsPageUnloading()
      )
        return;
      initialSyncDone.current = true;

      console.log("Syncing initial playback state...");
      ignoreEvents.current = true;

      // Force a short pause before sync to let the system stabilize
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check if we need to load the sound
      const currentUrl = audioElement.src || "";
      const shouldLoad = !currentUrl.endsWith(currentSound.source);
      let needsTimeUpdate = true;

      // If we need to load a new sound
      if (shouldLoad) {
        console.log(`Loading sound: ${currentSound.title}`);
        setIsLoading(true);

        // Ensure audio is paused before changing source
        if (!audioElement.paused) {
          safeAudioPause();
          // Give it a moment to properly pause
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        safeAudioSetSource(currentSound.source);
        safeAudioLoad();
      } else {
        // If the correct sound is already loaded, check if position needs updating
        needsTimeUpdate = Math.abs(audioElement.currentTime - currentTime) > 2;
      }

      // Sync volume
      safeAudioSetVolume(volume);

      // Set up the canplaythrough event to handle setting the current time and playing
      const handleCanPlayThrough = () => {
        const audioElement = getAudioElement();
        if (!audioElement) return;

        // Check if we need to update the current time
        if (needsTimeUpdate && currentTime > 0) {
          console.log(`Restoring playback position to ${currentTime} seconds`);
          try {
            // Don't try to set currentTime beyond duration
            if (audioElement.duration && currentTime < audioElement.duration) {
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
        audioElement.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough
        );
        setIsLoading(false);
        ignoreEvents.current = false;
      };

      // Add one-time event listener for when audio is ready
      audioElement.addEventListener("canplaythrough", handleCanPlayThrough);

      // If we didn't need to load a new sound and it's already ready to play
      if (!shouldLoad && audioElement.readyState >= 3) {
        console.log("Audio already ready, syncing position immediately");
        handleCanPlayThrough();
        audioElement.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough
        );
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

  // Setup audio event listeners
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

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

    audioElement.addEventListener("canplay", handleCanPlay);
    audioElement.addEventListener("loadstart", handleLoadStart);
    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("error", handleError);

    return () => {
      audioElement.removeEventListener("canplay", handleCanPlay);
      audioElement.removeEventListener("loadstart", handleLoadStart);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("error", handleError);
    };
  }, [isPlaying, persistState, setIsPlaying]);

  // Sync volume changes with audio element
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;
    safeAudioSetVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Handle play/pause state changes
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement || ignoreEvents.current || getIsPageUnloading()) return;

    // Check if the actual audio state matches what we expect
    const audioIsActuallyPlaying = isAudioPlaying();

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
    const audioElement = getAudioElement();
    if (!audioElement || !currentSound || ignoreEvents.current) return;

    console.log(`Changing track to ${currentSound.title}`);
    ignoreEvents.current = true;

    // Pause current audio before loading new track
    const wasPlaying = !audioElement.paused && !audioElement.ended;
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
    const audioElement = getAudioElement();
    if (!audioElement) return;

    // Save current position function
    const saveCurrentPosition = () => {
      if (!isLoading) {
        const newTime = getAudioCurrentTime();
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
      if (isPlaying && isAudioPlaying()) {
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
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }

      // Remove event listeners
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("ended", handleEnded);

      // Save one last time on unmount
      saveCurrentPosition();
    };
  }, [isPlaying, isLoading, currentTime, setCurrentTime, persistState]);

  // Handle window open/close
  useEffect(() => {
    // Set window as open when component mounts
    setIsWindowOpen(true);
    persistState({ isWindowOpen: true });

    // Set up visibilitychange listener to detect tab switches
    const handleVisibilityChange = () => {
      // If the page becomes hidden (e.g., switched tabs)
      if (document.visibilityState === "hidden" && !isWindowOpen) {
        // Save the current state
        const newTime = getAudioCurrentTime();
        setCurrentTime(newTime);
        persistState({ currentTime: newTime });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Mark window as closed when component unmounts and stop playback
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      setIsWindowOpen(false);
      persistState({ isWindowOpen: false });

      // When unmounting, this could be either minimization or closing
      // The actual stop will be handled by Window component's onClose handler

      if (getIsPageUnloading()) {
        stopAudio(); // Final cleanup on page unload
      }
    };
  }, [
    isWindowOpen,
    persistState,
    setIsWindowOpen,
    setCurrentTime,
    setIsPlaying,
  ]);

  // Handle window minimize state changes
  const handleMinimizeStateChange = (isMinimized: boolean) => {
    console.log(
      `Ambience window minimize state: ${
        isMinimized ? "minimized" : "restored"
      }`
    );
  };

  // Handle window close - explicitly stops the audio
  const handleWindowClose = () => {
    console.log("Ambience window closed, stopping audio");
    setIsPlaying(false);
    persistState({ isPlaying: false });
    stopAudio(); // Full cleanup on close
  };

  // Public methods to use in the component
  const playPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    persistState({ isPlaying: newPlayingState });
  };

  const next = () => {
    if (isLoading) return;
    setIsLoading(true);
    const newIndex = (currentSoundIndex + 1) % (currentSound ? 9 : 1); // Assuming 9 sounds total
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const previous = () => {
    if (isLoading) return;
    setIsLoading(true);
    const total = currentSound ? 9 : 1; // Assuming 9 sounds total
    const newIndex = (currentSoundIndex - 1 + total) % total;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const changeVolume = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    persistState({ volume: newVolume });
  };

  const toggleMute = () => {
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

  return {
    // State
    currentSound,
    currentSoundIndex,
    isPlaying,
    volume,
    isMuted,
    isLoading,
    isWindowOpen,

    // Methods
    playPause,
    next,
    previous,
    changeVolume,
    toggleMute,
    handleMinimizeStateChange,
    handleWindowClose,
  };
};
