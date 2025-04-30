"use client";

import React, { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  currentSoundAtom,
  isPlayingAtom,
  volumeAtom,
  ambiencePlayerActions,
} from "@/application/atoms/ambiencePlayerAtom";
import { consumeAppCleanupRequestsAtom } from "@/application/atoms/appLifecycleAtoms";

// Define the appId for this manager - MUST match appRegistry.ts key
const AMBIENCE_APP_ID = "ambience";

/**
 * GlobalAmbienceManager
 *
 * Handles ambient sound playback at the application level,
 * independent of window UI rendering to prevent interruptions.
 * This component is mounted once in the JotaiProvider and
 * manages audio playback based on global state.
 */
export const GlobalAmbienceManager: React.FC = () => {
  // Player state
  const [currentSound] = useAtom(currentSoundAtom);
  const [isPlaying] = useAtom(isPlayingAtom);
  const [volume] = useAtom(volumeAtom);
  const dispatchAction = useAtom(ambiencePlayerActions)[1];
  const consumeCleanupRequests = useAtom(consumeAppCleanupRequestsAtom)[1];

  // Audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayStateRef = useRef<boolean>(isPlaying);

  // Initialize audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.preload = "auto";
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Effect to handle application cleanup requests
  useEffect(() => {
    const cleanupRequests = consumeCleanupRequests(AMBIENCE_APP_ID);
    if (cleanupRequests.length > 0) {
      console.log(
        `[GlobalAmbienceManager] Received cleanup request for window(s): ${cleanupRequests
          .map((r) => r.windowId)
          .join(", ")}`
      );
      // Dispatch pause action when its window is closed
      dispatchAction({ type: "pause" });
      if (audioRef.current) {
        audioRef.current.pause(); // Ensure audio element is paused immediately
        audioRef.current.src = ""; // Clear source
      }
    }
  }, [consumeCleanupRequests, dispatchAction]);

  // Handle source changes
  useEffect(() => {
    if (!audioRef.current || !currentSound) return;

    // Only change source if it's different
    if (
      audioRef.current.src !==
      new URL(currentSound.source, window.location.origin).href
    ) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = currentSound.source;

      // Ensure continuous playback if already playing
      if (wasPlaying && isPlaying) {
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Audio source change failed:", error);
          });
        }
      } else {
        audioRef.current.load();
      }
    }
  }, [currentSound, isPlaying]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioRef.current) return;

    // Avoid unnecessary play/pause calls which can cause interruptions
    if (isPlaying !== lastPlayStateRef.current) {
      lastPlayStateRef.current = isPlaying;

      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Audio playback failed:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // No UI rendering - this is a background manager
  return null;
};
