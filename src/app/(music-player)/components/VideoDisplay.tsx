"use client";

import { useAtom, useSetAtom } from "jotai";
import { GripHorizontal, Maximize, Minimize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactPlayer, { YouTubeConfig } from "react-player/youtube";
import {
  musicPlayerAtom,
  nextSongAtom,
  playPauseAtom,
  setLoadingAtom,
  setPlayerProgressAtom,
  updatePlayerInternalsAtom,
} from "@/application/atoms/musicPlayerAtom";
import { useOnlineStatus } from "@/application/hooks";

// Keep a global reference to the YouTube player
let globalYoutubePlayer: any = null;

interface VideoDisplayProps {
  isVisible: boolean;
}

const DEFAULT_VIDEO_HEIGHT = 192;
const MIN_VIDEO_HEIGHT = 144;
const MAX_VIDEO_HEIGHT = 420;

const VideoDisplay = ({ isVisible }: VideoDisplayProps) => {
  const [playerState] = useAtom(musicPlayerAtom);
  const setLoading = useSetAtom(setLoadingAtom);
  const setPlayerProgress = useSetAtom(setPlayerProgressAtom);
  const updatePlayerInternals = useSetAtom(updatePlayerInternalsAtom);
  const nextSong = useSetAtom(nextSongAtom);
  const togglePlayPause = useSetAtom(playPauseAtom);
  const { isOnline } = useOnlineStatus();

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [videoHeight, setVideoHeight] = useState(DEFAULT_VIDEO_HEIGHT);
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(
    null
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement === containerRef.current) {
        await document.exitFullscreen();
        return;
      }

      await containerRef.current.requestFullscreen();
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  useEffect(() => {
    const handleResizeMove = (event: MouseEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;

      const nextHeight = Math.min(
        MAX_VIDEO_HEIGHT,
        Math.max(
          MIN_VIDEO_HEIGHT,
          resizeState.startHeight + (event.clientY - resizeState.startY)
        )
      );

      setVideoHeight(nextHeight);
    };

    const handleResizeEnd = () => {
      resizeStateRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  const handleResizeStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    resizeStateRef.current = {
      startY: event.clientY,
      startHeight: videoHeight,
    };

    setIsResizing(true);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

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
  } as YouTubeConfig;

  return (
    <div
      ref={containerRef}
      className={`player-wrapper transition-[height,opacity,margin] ${
        isResizing ? "duration-0" : "duration-150"
      } ease-out ${
        isVisible
          ? "relative mb-4 shrink-0 opacity-100"
          : "h-0 opacity-0 overflow-hidden pointer-events-none"
      }`}
      style={{
        height: isVisible ? (isFullscreen ? "100%" : `${videoHeight}px`) : 0,
      }}
    >
      {!isOnline ? (
        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-4 text-center text-sm text-muted-foreground">
          Music video playback is unavailable offline.
        </div>
      ) : null}
      {isOnline && playerState.currentSong ? (
        <>
          {isResizing ? (
            <div className="absolute inset-0 z-20 cursor-ns-resize" />
          ) : null}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute right-2 top-2 z-30 rounded-md bg-black/60 p-2 text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
          <div className="h-full overflow-hidden rounded-md">
            <ReactPlayer
              style={{
                borderRadius: "0.375rem",
                overflow: "hidden",
              }}
              ref={playerRef}
              url={playerState.currentSong.url}
              playing={playerState.isPlaying}
              volume={playerState.volume}
              controls={false} // Use our custom controls
              width="100%"
              height="100%"
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
                  setPlayerProgress({
                    playedSeconds,
                    currentTime: playedSeconds,
                  });
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
          </div>
          {!isFullscreen ? (
            <button
              type="button"
              onMouseDown={handleResizeStart}
              className="absolute inset-x-0 bottom-0 z-30 flex h-5 cursor-ns-resize items-end justify-center rounded-b-md bg-linear-to-t from-black/35 to-transparent pb-1 text-white/90"
              aria-label="Resize video height"
              title="Drag to resize video height"
            >
              <GripHorizontal className="h-4 w-4" />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default VideoDisplay;
