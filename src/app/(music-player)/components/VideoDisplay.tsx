"use client";

import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import ReactPlayer from "react-player/youtube";
import {
  musicPlayerAtom,
  playPauseAtom,
  nextSongAtom,
  setLoadingAtom,
  updatePlayerInternalsAtom,
  setPlayerProgressAtom,
} from "@/application/atoms/musicPlayerAtom";

// Keep a global reference to the YouTube player
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalYoutubePlayer: any = null;

interface VideoDisplayProps {
  isVisible: boolean;
}

const VideoDisplay = ({ isVisible }: VideoDisplayProps) => {
  const [playerState] = useAtom(musicPlayerAtom);
  const setLoading = useSetAtom(setLoadingAtom);
  const setPlayerProgress = useSetAtom(setPlayerProgressAtom);
  const updatePlayerInternals = useSetAtom(updatePlayerInternalsAtom);
  const nextSong = useSetAtom(nextSongAtom);
  const togglePlayPause = useSetAtom(playPauseAtom);

  const playerRef = useRef<ReactPlayer>(null);

  // Set up reference to the YouTube player instance when component mounts
  useEffect(() => {
    if (!playerRef.current) return;

    const updatePlayerRef = () => {
      if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer();
        if (player) {
          globalYoutubePlayer = player;

          // Apply volume settings when player is ready
          if (
            globalYoutubePlayer &&
            typeof globalYoutubePlayer.setVolume === "function"
          ) {
            globalYoutubePlayer.setVolume(
              playerState.isMuted ? 0 : playerState.volume * 100
            );
          }
        }
      }
    };

    // Try immediately and also after a delay
    updatePlayerRef();
    const timer = setTimeout(updatePlayerRef, 1000);

    return () => clearTimeout(timer);
  }, [playerState.isMuted, playerState.volume]);

  // Setup cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.pauseVideo === "function"
      ) {
        try {
          // Ensure we persist the state one last time
          if (playerRef.current) {
            const newTime = playerRef.current.getCurrentTime() || 0;
            updatePlayerInternals({ currentTime: newTime });
          }
          globalYoutubePlayer.pauseVideo();
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [updatePlayerInternals]);

  // Effect to seek when the currentTime changes due to external action (like ProgressBar)
  useEffect(() => {
    if (
      playerRef.current &&
      playerState.seeking &&
      Math.abs(playerRef.current.getCurrentTime() - playerState.currentTime) > 1
    ) {
      playerRef.current.seekTo(playerState.currentTime, "seconds");
    }
  }, [playerState.currentTime, playerState.seeking]);

  // Effect to control playback state (play/pause)
  useEffect(() => {
    if (!playerRef.current) return;
    const player = playerRef.current.getInternalPlayer();
    if (player) {
      try {
        if (playerState.isPlaying) {
          player.playVideo?.();
        } else {
          player.pauseVideo?.();
        }
      } catch (error) {
        console.error("Error applying play/pause state:", error);
      }
    }
  }, [playerState.isPlaying]);

  // Effect to control volume (including mute)
  useEffect(() => {
    if (!playerRef.current) return;
    const player = playerRef.current.getInternalPlayer();
    if (player && typeof player.setVolume === "function") {
      player.setVolume(playerState.volume * 100);
    }
  }, [playerState.volume]);

  // Define config separately with explicit type for clarity
  const playerConfig = {
    youtube: {
      playerVars: {
        controls: 0, // Disable default YouTube controls
      },
    },
  };

  return (
    <div
      className={`player-wrapper transition-all duration-300 ease-in-out ${
        isVisible
          ? "h-48 mb-4 opacity-100"
          : "h-0 opacity-0 overflow-hidden pointer-events-none"
      }`}
    >
      {playerState.currentSong && (
        <ReactPlayer
          ref={playerRef}
          url={playerState.currentSong.url}
          playing={playerState.isPlaying}
          volume={playerState.volume}
          controls={false} // Use our custom controls
          width="100%"
          height="100%"
          style={{
            borderRadius: "0.375rem",
            overflow: "hidden",
          }}
          onReady={(player) => {
            setLoading(false);
            console.log("Player ready");
            const internalPlayer = player.getInternalPlayer();
            if (
              internalPlayer &&
              typeof internalPlayer.setVolume === "function"
            ) {
              internalPlayer.setVolume(playerState.volume * 100);
            }
          }}
          onStart={() => {
            setLoading(false);
            console.log("Player started");
          }}
          onPlay={() => {
            if (!playerState.isPlaying) togglePlayPause();
            setLoading(false);
          }}
          onPause={() => {
            if (playerState.isPlaying) togglePlayPause();
          }}
          onBuffer={() => setLoading(true)}
          onBufferEnd={() => setLoading(false)}
          onDuration={(duration) => {
            updatePlayerInternals({ duration });
          }}
          onProgress={({ playedSeconds }) => {
            // Only update progress if the user is not actively seeking
            if (!playerState.seeking) {
              setPlayerProgress({ playedSeconds, currentTime: playedSeconds });
            }
          }}
          onError={(e, data) => {
            // Mark unused parameters
            console.error("Player error:", e, data);
            setLoading(false);
          }}
          onEnded={() => {
            console.log("Song ended");
            nextSong();
          }}
          config={playerConfig} // Pass the typed config object
        />
      )}
    </div>
  );
};

export default VideoDisplay;
