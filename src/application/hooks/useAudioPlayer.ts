import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import {
  currentSoundAtom,
  isPlayingAtom,
  persistAmbiencePlayerState,
  volumeAtom,
} from "@/application/atoms/ambiencePlayerAtom";

export const useAudioPlayer = () => {
  // Global state using Jotai atoms
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [currentSound] = useAtom(currentSoundAtom);
  const [, persistState] = useAtom(persistAmbiencePlayerState);

  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [hasMounted, setHasMounted] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ignoreEventsRef = useRef(false);
  const isInitializedRef = useRef(false);

  // First mount effect - ensure we start in stopped state
  useEffect(() => {
    // On first mount, reset playing state - prevents autoplay errors on refresh
    setIsPlaying(false);
    persistState({ isPlaying: false });
    setHasMounted(true);

    // Record the unmount event
    return () => {
      // Reset state on unmount (page navigation/refresh/close)
      setIsPlaying(false);
      persistState({ isPlaying: false });
    };
  }, [setIsPlaying, persistState]);

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
      }
    };
  }, []);

  // Handle source and volume changes
  useEffect(() => {
    if (!audioRef.current || !currentSound || !hasMounted) return;

    const audio = audioRef.current;
    const wasPlaying = !audio.paused;

    // Set source if needed
    if (!audio.src.endsWith(currentSound.source)) {
      setIsLoading(true);

      // Handle potential network errors or missing files
      try {
        audio.src = currentSound.source;
      } catch (error) {
        console.error("Error setting audio source:", error);
        setIsLoading(false);
        setIsPlaying(false);
        persistState({ isPlaying: false });
        return;
      }

      // Add event listener for when the audio can play
      const handleCanPlayThrough = () => {
        setIsLoading(false);
        // Only auto-play if there's been explicit user interaction to play
        if ((wasPlaying || isPlaying) && isInitializedRef.current) {
          audio.play().catch((error) => {
            console.error("Error auto-playing after track change:", error);
            setIsPlaying(false);
            persistState({ isPlaying: false });
          });
        }
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      };

      audio.addEventListener("canplaythrough", handleCanPlayThrough);

      // Set a timeout to handle cases where canplaythrough might not fire
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      };
    }

    // Set volume
    audio.volume = isMuted ? 0 : volume;
  }, [
    currentSound,
    volume,
    isMuted,
    isPlaying,
    persistState,
    setIsPlaying,
    hasMounted,
  ]);

  // Handle play/pause state - only respond to user-initiated play actions
  useEffect(() => {
    if (!audioRef.current || ignoreEventsRef.current || !hasMounted) return;

    const audio = audioRef.current;

    const playAudio = async () => {
      // Mark that we've had a user interaction to play
      isInitializedRef.current = true;

      try {
        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA or better
          await audio.play();
        } else {
          // If the audio isn't ready yet, wait for it
          const onCanPlay = async () => {
            try {
              await audio.play();
            } catch (error) {
              console.error(
                "Error playing audio after waiting for canplay:",
                error
              );
              setIsPlaying(false);
              persistState({ isPlaying: false });
            }
            audio.removeEventListener("canplay", onCanPlay);
          };
          audio.addEventListener("canplay", onCanPlay);

          // Safety timeout
          setTimeout(() => {
            audio.removeEventListener("canplay", onCanPlay);
            if (isPlaying && audio.paused) {
              setIsPlaying(false);
              persistState({ isPlaying: false });
            }
          }, 5000);
        }
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
  }, [isPlaying, persistState, setIsPlaying, hasMounted]);

  // Set up audio event listeners
  useEffect(() => {
    if (!audioRef.current || !hasMounted) return;

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

      // Try to recover by resetting the audio element
      try {
        audio.load();
      } catch (loadError) {
        console.error("Failed to reload audio after error:", loadError);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Handle visibility change - don't auto-resume on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // When the document becomes hidden, just note the state
        // Don't try to auto-resume on becoming visible again
        if (!audio.paused) {
          audio.pause();
          // Keep isPlaying true in state if it was playing
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, persistState, setIsPlaying, hasMounted]);

  // Function to update the audio element's volume
  const updateAudioVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return {
    isPlaying,
    isMuted,
    isLoading,
    volume,
    prevVolume,
    setPrevVolume,
    setIsMuted,
    setVolume,
    setIsPlaying,
    persistState,
    updateAudioVolume,
  };
};
