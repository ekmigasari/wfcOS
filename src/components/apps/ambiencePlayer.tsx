"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  ambienceSounds,
  currentSoundIndexAtom,
  isPlayingAtom,
  volumeAtom,
  persistAmbiencePlayerState,
  currentSoundAtom,
  isWindowOpenAtom,
} from "../../atoms/ambiencePlayerAtom";
import { playSound } from "@/lib/utils";

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
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// Create a global audio element to ensure playback continues when window is closed
let globalAudio: HTMLAudioElement | null = null;

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
  const [, persistState] = useAtom(persistAmbiencePlayerState);

  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isLoading, setIsLoading] = useState(false);

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

  // Cleanup globalAudio when component unmounts
  useEffect(() => {
    return () => {
      // We don't want to destroy the audio element since it might be playing in background,
      // but we should reset its listeners and state for proper cleanup
      if (globalAudio) {
        globalAudio.oncanplay = null;
        globalAudio.onloadstart = null;
        globalAudio.onerror = null;
      }
    };
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    if (!globalAudio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        globalAudio?.play().catch((error) => {
          console.error("Error playing sound:", error);
          setIsPlaying(false);
          persistState({ isPlaying: false });
        });
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    globalAudio.addEventListener("canplay", handleCanPlay);
    globalAudio.addEventListener("loadstart", handleLoadStart);

    return () => {
      globalAudio?.removeEventListener("canplay", handleCanPlay);
      globalAudio?.removeEventListener("loadstart", handleLoadStart);
    };
  }, [isPlaying, persistState, setIsPlaying]);

  // Initialize audio with current sound when component mounts
  useEffect(() => {
    if (!globalAudio || !currentSound) return;

    // Always pause the current audio before loading a new one
    globalAudio.pause();
    setIsLoading(true);

    globalAudio.src = currentSound.source;
    globalAudio.load();

    // Reset play state if needed
    if (!isPlaying) {
      setIsPlaying(false);
      persistState({ isPlaying: false });
    }
  }, [currentSound, isPlaying, persistState, setIsPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!globalAudio) return;
    globalAudio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!globalAudio) return;

    if (isPlaying && !isLoading) {
      globalAudio.play().catch((error) => {
        console.error("Error playing sound:", error);
        setIsPlaying(false);
        persistState({ isPlaying: false });
      });
    } else if (!isPlaying) {
      globalAudio.pause();
    }
  }, [isPlaying, isLoading, persistState, setIsPlaying]);

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

    // Stop current sound
    if (globalAudio) {
      globalAudio.pause();
    }

    // Set loading state before changing track
    setIsLoading(true);

    const newIndex = (currentSoundIndex + 1) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  const handlePrevious = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;

    playSound("/sounds/click.mp3");

    // Stop current sound
    if (globalAudio) {
      globalAudio.pause();
    }

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
            <span>of {ambienceSounds.length}</span>
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
