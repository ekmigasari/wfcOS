"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  musicPlayerAtom,
  persistMusicPlayerState,
} from "@/application/atoms/musicPlayerAtom";

/**
 * GlobalMusicPlayerManager
 *
 * A global component that manages music player state regardless of window state.
 * - Handles background playback when window is minimized
 * - Updates document title to show current song
 * - Ensures the player can continue when the window is minimized
 */
export const GlobalMusicPlayerManager = () => {
  const [playerState, setPlayerState] = useAtom(musicPlayerAtom);
  const [, persistState] = useAtom(persistMusicPlayerState);
  const titleUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize title updates for the music player
  useEffect(() => {
    const updateTitle = () => {
      if (typeof window === "undefined") return;

      if (playerState.isPlaying && !playerState.isWindowOpen) {
        const songTitle = playerState.currentSong?.title || "Music";
        document.title = `▶️ ${songTitle} - wfcOS`;
      } else if (!playerState.isPlaying && !playerState.isWindowOpen) {
        document.title = `⏸️ Music (Paused) - wfcOS`;
      } else if (!playerState.isWindowOpen) {
        document.title = "wfcOS";
      }
    };

    updateTitle();
    titleUpdateInterval.current = setInterval(updateTitle, 2000);

    return () => {
      if (titleUpdateInterval.current) {
        clearInterval(titleUpdateInterval.current);
      }
    };
  }, [
    playerState.isPlaying,
    playerState.isWindowOpen,
    playerState.currentSong,
  ]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && playerState.isPlaying) {
        // Keep playing when minimized or tab switched
        setPlayerState((prev) => ({ ...prev, isWindowOpen: false }));
      } else if (document.visibilityState === "visible") {
        setPlayerState((prev) => ({ ...prev, isWindowOpen: true }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerState.isPlaying, setPlayerState]);

  // Sync with unload events
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistState({
        isPlaying: playerState.isPlaying,
        currentTime: playerState.currentTime,
        currentSongIndex: playerState.currentSongIndex,
        isWindowOpen: playerState.isWindowOpen,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    playerState.isPlaying,
    playerState.currentTime,
    playerState.currentSongIndex,
    playerState.isWindowOpen,
    persistState,
  ]);

  // This component doesn't render any visible UI
  return null;
};

export default GlobalMusicPlayerManager;
