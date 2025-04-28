"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import ReactPlayer from "react-player/youtube";
import {
  musicPlayerAtom,
  persistMusicPlayerState,
} from "@/application/atoms/musicPlayerAtom";

// Keep a global reference to the YouTube player
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalYoutubePlayer: any = null;

interface VideoDisplayProps {
  isVisible: boolean;
}

const VideoDisplay = ({ isVisible }: VideoDisplayProps) => {
  const [playerState, setPlayerState] = useAtom(musicPlayerAtom);
  const [, persistState] = useAtom(persistMusicPlayerState);
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
            persistState({ currentTime: newTime });
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
  }, [persistState]);

  // Sync player state when it's ready
  useEffect(() => {
    if (!playerRef.current || !playerState.currentSong) return;

    const syncTimer = setTimeout(() => {
      try {
        setPlayerState((state) => ({ ...state, isLoading: false }));

        // If we have a saved position, seek to it
        if (playerState.currentTime > 0) {
          playerRef.current?.seekTo(playerState.currentTime, "seconds");
        }

        // Apply volume settings
        const player = playerRef.current?.getInternalPlayer();
        if (player && typeof player.setVolume === "function") {
          player.setVolume(playerState.isMuted ? 0 : playerState.volume * 100);
        }

        // Update playing state based on saved state
        setTimeout(() => {
          const player = playerRef.current?.getInternalPlayer();
          if (player) {
            if (playerState.isPlaying) {
              player.playVideo();
            } else {
              player.pauseVideo();
            }
          }
        }, 500);
      } catch (error) {
        console.error("Error syncing player state:", error);
      }
    }, 1000);

    return () => clearTimeout(syncTimer);
  }, [
    playerState.currentSong,
    playerState.currentTime,
    persistState,
    playerState.isPlaying,
    playerState.isMuted,
    playerState.volume,
    setPlayerState,
  ]);

  // Update playing state when it changes
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      const player = playerRef.current.getInternalPlayer();
      if (player) {
        if (playerState.isPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    } catch (error) {
      console.error("Error applying play/pause state:", error);
    }
  }, [playerState.isPlaying]);

  // Save current position periodically
  useEffect(() => {
    if (!playerRef.current) return;

    // Save position function
    const savePosition = () => {
      if (playerRef.current && !playerState.seeking && playerState.isPlaying) {
        const newTime = playerRef.current.getCurrentTime() || 0;
        if (Math.abs(newTime - playerState.currentTime) > 1) {
          persistState({
            currentTime: newTime,
            playedSeconds: newTime,
          });
        }
      }
    };

    // Set up interval to save position
    const interval = setInterval(savePosition, 5000);

    return () => {
      clearInterval(interval);
      savePosition(); // Save one last time on unmount
    };
  }, [
    playerState.currentTime,
    playerState.seeking,
    playerState.isPlaying,
    persistState,
  ]);

  return (
    <div
      className={`player-wrapper ${
        isVisible ? "h-48 mb-4" : "h-0 overflow-hidden"
      }`}
    >
      {playerState.currentSong && (
        <ReactPlayer
          ref={playerRef}
          url={playerState.currentSong.url}
          playing={playerState.isPlaying}
          controls={isVisible}
          volume={playerState.isMuted ? 0 : playerState.volume}
          width="100%"
          height="100%"
          style={{
            borderRadius: "0.375rem",
            overflow: "hidden",
          }}
          onReady={() => {
            // Update the global player reference when ready
            if (playerRef.current) {
              globalYoutubePlayer = playerRef.current.getInternalPlayer();

              // Set volume when player is ready
              if (typeof globalYoutubePlayer.setVolume === "function") {
                globalYoutubePlayer.setVolume(
                  playerState.isMuted ? 0 : playerState.volume * 100
                );
              }

              setPlayerState((state) => ({ ...state, isLoading: false }));
            }
          }}
          onDuration={(duration) => {
            setPlayerState((state) => ({ ...state, duration }));
          }}
          onProgress={(state) => {
            if (!playerState.seeking) {
              setPlayerState((prev) => ({
                ...prev,
                playedSeconds: state.playedSeconds,
              }));
            }
          }}
          onError={(e) => {
            console.error("Player error:", e);
            setPlayerState((state) => ({ ...state, isLoading: false }));
          }}
          onEnded={() => {
            if (playerState.playlist.length <= 1) {
              persistState({ isPlaying: false });
            } else {
              const nextIndex =
                (playerState.currentSongIndex + 1) %
                playerState.playlist.length;
              persistState({
                currentSongIndex: nextIndex,
                currentTime: 0,
                currentSong: playerState.playlist[nextIndex],
              });
            }
          }}
          config={{
            playerVars: {
              rel: 0,
              showinfo: 0,
              modestbranding: 1,
              iv_load_policy: 3,
              disablekb: 1,
              fs: 0,
            },
            onUnstarted: () => {
              // Handle case where YouTube API fails to auto-play
              if (playerState.isPlaying && playerRef.current) {
                try {
                  const player = playerRef.current.getInternalPlayer();
                  if (player && typeof player.playVideo === "function") {
                    player.playVideo();
                  }
                } catch (e) {
                  console.error("Error playing video:", e);
                }
              }
            },
          }}
        />
      )}
    </div>
  );
};

export default VideoDisplay;
