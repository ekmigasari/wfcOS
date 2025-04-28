"use client";

import { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { updateMusicPlayerStateAtom } from "@/application/atoms/musicPlayerAtom";
import { globalYoutubePlayer } from "../MusicPlayer";

// Set up beforeunload handler to prevent audio issues
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (globalYoutubePlayer) {
      try {
        globalYoutubePlayer.pauseVideo();
      } catch (e) {
        console.error("Error stopping YouTube playback:", e);
      }
    }
  });
}

/**
 * GlobalMusicManager
 *
 * A global component that manages music playback regardless of window state.
 * - Maintains playback when window is minimized
 * - Persists player state using Jotai atoms
 * - Handles background playback
 */
export const GlobalMusicManager = () => {
  const [state, updateMusicPlayerState] = useAtom(updateMusicPlayerStateAtom);
  const ignoreEvents = useRef(false);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const { isPlaying, volume, currentTime, isWindowOpen } = state;

  // Set up position tracking interval
  useEffect(() => {
    if (!globalYoutubePlayer) return;

    // Save current position function
    const saveCurrentPosition = () => {
      if (globalYoutubePlayer && isPlaying) {
        try {
          const newTime = globalYoutubePlayer.getCurrentTime() || 0;
          // Only save if changed significantly
          if (Math.abs(newTime - currentTime) > 1) {
            updateMusicPlayerState({ currentTime: newTime });
          }
        } catch (e) {
          console.error("Error getting current time:", e);
        }
      }
    };

    // Periodically save position
    timeUpdateInterval.current = setInterval(() => {
      if (isPlaying) {
        saveCurrentPosition();
      }
    }, 5000);

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      saveCurrentPosition();
    };
  }, [isPlaying, currentTime, updateMusicPlayerState]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isWindowOpen) {
        if (globalYoutubePlayer) {
          try {
            const newTime = globalYoutubePlayer.getCurrentTime() || 0;
            updateMusicPlayerState({ currentTime: newTime });
          } catch (e) {
            console.error("Error getting current time:", e);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWindowOpen, updateMusicPlayerState]);

  // Handle global player status
  useEffect(() => {
    // Skip if player isn't ready
    if (!globalYoutubePlayer) return;
    if (ignoreEvents.current) return;

    try {
      // Apply volume changes
      if (typeof globalYoutubePlayer.setVolume === "function") {
        globalYoutubePlayer.setVolume(volume * 100);
      }

      // Apply playing state
      if (isPlaying) {
        globalYoutubePlayer.playVideo();
      } else {
        globalYoutubePlayer.pauseVideo();
      }
    } catch (error) {
      console.error("Error controlling global player:", error);
    }
  }, [isPlaying, volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  // This component doesn't render any visible UI
  return null;
};

export default GlobalMusicManager;
