import { useAtom } from "jotai";
import {
  ambienceSounds,
  currentSoundIndexAtom,
  persistAmbiencePlayerState,
} from "@/application/atoms/ambiencePlayerAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { useAudioPlayer } from "./useAudioPlayer";

export const useAmbienceControls = () => {
  const [currentSoundIndex, setCurrentSoundIndex] = useAtom(
    currentSoundIndexAtom
  );
  const [, persistState] = useAtom(persistAmbiencePlayerState);
  const {
    isPlaying,
    setIsPlaying,
    isLoading,
    volume,
    isMuted,
    setIsMuted,
    setVolume,
    prevVolume,
    setPrevVolume,
    updateAudioVolume,
  } = useAudioPlayer();

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
    updateAudioVolume(newVolume);
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
      updateAudioVolume(newVolume);
    } else {
      // Mute
      setPrevVolume(volume);
      setIsMuted(true);
      updateAudioVolume(0);
    }
  };

  return {
    currentSoundIndex,
    isPlaying,
    isLoading,
    isMuted,
    volume,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleVolumeChange,
    handleToggleMute,
  };
};
