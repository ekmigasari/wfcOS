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
  ambienceSounds,
} from "../atoms/ambiencePlayerAtom";
import {
  initializeAudio,
  playAudio,
  pauseAudio,
  setAudioSource,
  setAudioCurrentTime,
  setAudioVolume,
  getAudioElement,
  getAudioCurrentTime,
  stopAudio,
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

  // Handle sound source and playback state changes
  useEffect(() => {
    if (!currentSound) return;

    const syncPlayback = async () => {
      if (ignoreEvents.current) return;

      ignoreEvents.current = true;
      setIsLoading(true);

      // Set the audio source
      setAudioSource(currentSound.source);

      // Set the playback position if available
      if (currentTime > 0) {
        setAudioCurrentTime(currentTime);
      }

      // Apply volume setting
      setAudioVolume(volume);

      // Play or pause based on state
      if (isPlaying) {
        try {
          await playAudio();
        } catch (error) {
          console.error("Error starting playback:", error);
          setIsPlaying(false);
          persistState({ isPlaying: false });
        }
      } else {
        pauseAudio();
      }

      ignoreEvents.current = false;
    };

    syncPlayback();

    // Setup audio update interval
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    timeUpdateInterval.current = setInterval(() => {
      if (isPlaying) {
        const newTime = getAudioCurrentTime();
        setCurrentTime(newTime);
        persistState({ currentTime: newTime });
      }
    }, 5000); // Update position every 5 seconds

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
    };
  }, [
    currentSound,
    isPlaying,
    volume,
    persistState,
    currentTime,
    setIsPlaying,
    setCurrentTime,
  ]);

  // Setup audio event listeners
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handlePlay = () => {
      if (!isPlaying && !ignoreEvents.current) {
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
  }, [isPlaying, persistState]);

  // Handle window open/close
  useEffect(() => {
    // Set window as open when component mounts
    setIsWindowOpen(true);
    persistState({ isWindowOpen: true });

    // Mark window as closed when component unmounts
    return () => {
      setIsWindowOpen(false);
      persistState({ isWindowOpen: false });
    };
  }, [persistState, setIsWindowOpen]);

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

    if (newPlayingState) {
      playAudio().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        persistState({ isPlaying: false });
      });
    } else {
      pauseAudio();
    }
  };

  const next = () => {
    if (isLoading) return;
    const newIndex = (currentSoundIndex + 1) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const previous = () => {
    if (isLoading) return;
    const newIndex =
      (currentSoundIndex - 1 + ambienceSounds.length) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const changeVolume = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setAudioVolume(newVolume);
    setIsMuted(newVolume === 0);
    persistState({ volume: newVolume });
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute
      const newVolume = prevVolume > 0 ? prevVolume : 0.5;
      setIsMuted(false);
      setVolume(newVolume);
      setAudioVolume(newVolume);
      persistState({ volume: newVolume });
    } else {
      // Mute
      setPrevVolume(volume);
      setIsMuted(true);
      setAudioVolume(0);
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
    handleWindowClose,
  };
};
