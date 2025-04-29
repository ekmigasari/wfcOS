"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import {
  ambienceSounds,
  currentSoundAtom,
  currentSoundIndexAtom,
  isPlayingAtom,
  persistAmbiencePlayerState,
  volumeAtom,
} from "@/application/atoms/ambiencePlayerAtom";
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

type AmbiencePlayerProps = {
  windowId?: string;
};

const AmbiencePlayer: React.FC<AmbiencePlayerProps> = () => {
  // Global state using Jotai atoms
  const [currentSoundIndex, setCurrentSoundIndex] = useAtom(
    currentSoundIndexAtom
  );
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [currentSound] = useAtom(currentSoundAtom);
  const [, persistState] = useAtom(persistAmbiencePlayerState);

  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ignoreEventsRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    // Clean up on unmount - this ensures audio stops when window closes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;

        // Update atom state
        setIsPlaying(false);
        persistState({ isPlaying: false });
      }
    };
  }, [persistState, setIsPlaying]);

  // Handle source and volume changes
  useEffect(() => {
    if (!audioRef.current || !currentSound) return;

    const audio = audioRef.current;

    // Set source if needed
    if (!audio.src.endsWith(currentSound.source)) {
      setIsLoading(true);
      audio.src = currentSound.source;
    }

    // Set volume
    audio.volume = isMuted ? 0 : volume;
  }, [currentSound, volume, isMuted]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioRef.current || ignoreEventsRef.current) return;

    const audio = audioRef.current;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        persistState({ isPlaying: false });
      }
    };

    if (isPlaying && (audio.paused || audio.ended)) {
      playAudio();
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, persistState, setIsPlaying]);

  // Set up audio event listeners
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlay = () => {
      if (!isPlaying && !ignoreEventsRef.current) {
        ignoreEventsRef.current = true;
        setIsPlaying(true);
        persistState({ isPlaying: true });
        setTimeout(() => {
          ignoreEventsRef.current = false;
        }, 100);
      }
    };

    const handlePause = () => {
      if (isPlaying && !ignoreEventsRef.current) {
        ignoreEventsRef.current = true;
        setIsPlaying(false);
        persistState({ isPlaying: false });
        setTimeout(() => {
          ignoreEventsRef.current = false;
        }, 100);
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      persistState({ isPlaying: false });
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [isPlaying, persistState, setIsPlaying]);

  // Handle playback toggle
  const handlePlayPause = () => {
    playSound("/sounds/click.mp3");
    setIsPlaying(!isPlaying);
    persistState({ isPlaying: !isPlaying });
  };

  // Skip to next track
  const handleNext = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;
    playSound("/sounds/click.mp3");

    const newIndex = (currentSoundIndex + 1) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  // Skip to previous track
  const handlePrevious = () => {
    if (ambienceSounds.length <= 1 || isLoading) return;
    playSound("/sounds/click.mp3");

    const newIndex =
      (currentSoundIndex - 1 + ambienceSounds.length) % ambienceSounds.length;
    setCurrentSoundIndex(newIndex);
    persistState({ currentSoundIndex: newIndex });
  };

  // Change volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    persistState({ volume: newVolume });

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute
  const handleToggleMute = () => {
    playSound("/sounds/click.mp3");

    if (isMuted) {
      // Unmute
      const newVolume = prevVolume > 0 ? prevVolume : 0.5;
      setIsMuted(false);
      setVolume(newVolume);
      persistState({ volume: newVolume });

      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    } else {
      // Mute
      setPrevVolume(volume);
      setIsMuted(true);

      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
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
          onClick={handleToggleMute}
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
