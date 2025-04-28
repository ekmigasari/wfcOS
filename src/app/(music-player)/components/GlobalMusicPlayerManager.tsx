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
    // Function to update the document title
    const updateTitle = () => {
      if (typeof window === "undefined") return;

      if (playerState.isPlaying && !playerState.isWindowOpen) {
        // Show currently playing song in title when minimized
        const songTitle = playerState.currentSong?.title || "Music";
        document.title = `▶️ ${songTitle} - wfcOS`;
      } else if (!playerState.isPlaying && !playerState.isWindowOpen) {
        // Show paused state when minimized
        document.title = `⏸️ Music (Paused) - wfcOS`;
      } else if (!playerState.isWindowOpen) {
        // Default title when music player is not open
        document.title = "wfcOS";
      }
    };

    // Set up interval to update title (in case of song change)
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
    setPlayerState,
  ]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the page becomes hidden (e.g., switched tabs) while player is active
      if (
        document.visibilityState === "hidden" &&
        !playerState.isWindowOpen &&
        playerState.isPlaying
      ) {
        // We do nothing - music should continue playing
        console.log("Page hidden but music continuing in background");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerState.isWindowOpen, playerState.isPlaying, persistState]);

  // Sync with unload events
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save state before unloading page
      persistState({
        isPlaying: playerState.isPlaying,
        currentTime: playerState.currentTime,
        currentSongIndex: playerState.currentSongIndex,
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
    persistState,
  ]);

  // This component doesn't render any visible UI
  return null;
};

export default GlobalMusicPlayerManager;
