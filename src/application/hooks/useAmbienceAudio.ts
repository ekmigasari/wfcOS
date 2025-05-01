"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Sound definition (moved from atoms)
export interface AmbienceSound {
  id: string;
  title: string;
  source: string;
}

// Sound list (moved from atoms)
export const ambienceSounds: AmbienceSound[] = [
  { id: "rain", title: "Gentle Rain", source: "/sounds/ambience/rain.mp3" },
  {
    id: "forest",
    title: "Forest Sounds",
    source: "/sounds/ambience/forest.mp3",
  },
  { id: "river", title: "Flowing River", source: "/sounds/ambience/river.mp3" },
  { id: "ocean", title: "Ocean Waves", source: "/sounds/ambience/ocean.mp3" },
  {
    id: "thunder",
    title: "Thunderstorm",
    source: "/sounds/ambience/thunder.mp3",
  },
  { id: "night", title: "Calm Night", source: "/sounds/ambience/night.mp3" },
  {
    id: "fireplace",
    title: "Fireplace",
    source: "/sounds/ambience/fireplace.mp3",
  },
  { id: "cafe", title: "Coffee Shop", source: "/sounds/ambience/cafe.mp3" },
  { id: "park", title: "Park Ambience", source: "/sounds/ambience/park.mp3" },
  {
    id: "coffee",
    title: "Making a coffee",
    source: "/sounds/ambience/making-a-coffee-latte.mp3",
  },
];

const DEFAULT_VOLUME = 0.7;

export const useAmbienceAudio = () => {
  // --- Local State ---
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevVolumeBeforeMute, setPrevVolumeBeforeMute] =
    useState(DEFAULT_VOLUME);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false); // Tracks if user has interacted to play

  // --- Derived State ---
  const currentSound = ambienceSounds[currentSoundIndex];

  // --- Effects ---

  // Initialize and cleanup audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    isInitializedRef.current = false; // Reset on mount

    const audioElement = audioRef.current; // Capture for cleanup

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = ""; // Release resource
      }
      audioRef.current = null;
      setIsPlaying(false); // Ensure state is reset on unmount
    };
  }, []); // Runs only on mount and unmount

  // Handle source changes
  useEffect(() => {
    if (!audioRef.current || !currentSound) return;

    const audio = audioRef.current;
    const wasPlaying = isPlaying; // Check internal state

    // Set source only if it changed
    if (!audio.src.endsWith(currentSound.source)) {
      setIsLoading(true);
      audio.src = currentSound.source;
      audio.load(); // Explicitly load the new source

      const handleCanPlayThrough = () => {
        setIsLoading(false);
        // Only auto-play if it was playing before source change *and* user initiated play
        if (wasPlaying && isInitializedRef.current) {
          audio.play().catch((error) => {
            console.error("Error auto-playing after track change:", error);
            setIsPlaying(false);
          });
        }
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
        audio.removeEventListener("error", handleErrorLoading); // Clean up error listener
      };

      const handleErrorLoading = (e: Event) => {
        console.error("Error loading audio source:", e);
        setIsLoading(false);
        setIsPlaying(false);
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
        audio.removeEventListener("error", handleErrorLoading);
      };

      audio.addEventListener("canplaythrough", handleCanPlayThrough);
      audio.addEventListener("error", handleErrorLoading);

      return () => {
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
        audio.removeEventListener("error", handleErrorLoading);
      };
    }
  }, [currentSound, isPlaying]); // isPlaying dependency needed for autoplay logic

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle play/pause state changes triggered by state
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const playAudio = async () => {
      if (!isInitializedRef.current) return; // Don't play automatically on load
      setIsLoading(true);
      try {
        await audio.play();
        setIsPlaying(true); // Sync state if play succeeds
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false); // Sync state if play fails
      } finally {
        setIsLoading(false);
      }
    };

    if (isPlaying && audio.paused) {
      playAudio();
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]); // Only react to isPlaying state changes

  // --- Control Functions (Callbacks) ---

  const togglePlayPause = useCallback(() => {
    // Mark user interaction on first play attempt
    if (!isPlaying && !isInitializedRef.current) {
      isInitializedRef.current = true;
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    setCurrentSoundIndex(
      (prevIndex) => (prevIndex + 1) % ambienceSounds.length
    );
    isInitializedRef.current = false; // Require new play action for new track
    setIsPlaying(false); // Stop playback when changing track
  }, []);

  const previousTrack = useCallback(() => {
    setCurrentSoundIndex(
      (prevIndex) =>
        (prevIndex - 1 + ambienceSounds.length) % ambienceSounds.length
    );
    isInitializedRef.current = false; // Require new play action for new track
    setIsPlaying(false); // Stop playback when changing track
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => {
      const newMuted = !prevMuted;
      if (newMuted) {
        setPrevVolumeBeforeMute(volume);
        setVolume(0);
      } else {
        // Restore previous volume only if it was > 0, otherwise default
        setVolume(
          prevVolumeBeforeMute > 0 ? prevVolumeBeforeMute : DEFAULT_VOLUME
        );
      }
      return newMuted;
    });
  }, [volume, prevVolumeBeforeMute]);

  // --- Return Hook State and Controls ---
  return {
    currentSound,
    isPlaying,
    volume,
    isMuted,
    isLoading,
    togglePlayPause,
    nextTrack,
    previousTrack,
    changeVolume,
    toggleMute,
  };
};
