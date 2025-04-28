"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import ReactPlayer from "react-player/youtube";
import { setGlobalYoutubePlayer } from "../MusicPlayer";

// Define interface for YouTube player
export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  [key: string]: unknown;
}

export interface PlayerRef {
  getInternalPlayer: () => YouTubePlayer | null;
  seekTo: (time: number, type?: "seconds" | "fraction") => void;
  getCurrentTime: () => number;
}

interface YoutubePlayerProps {
  url?: string;
  playing: boolean;
  controls: boolean;
  showVideo: boolean;
  volume: number;
  isMuted: boolean;
  onReady: () => void;
  onDuration: (duration: number) => void;
  onProgress: (state: { playedSeconds: number }) => void;
  onEnded: () => void;
  onError: (error: Error) => void;
}

export const YoutubePlayer = forwardRef<PlayerRef, YoutubePlayerProps>(
  (
    {
      url,
      playing,
      controls,
      showVideo,
      onReady,
      onDuration,
      onProgress,
      onEnded,
      onError,
    },
    ref
  ) => {
    const playerRef = useRef<ReactPlayer>(null);

    // Forward the ref's methods
    useImperativeHandle(
      ref,
      () => ({
        getInternalPlayer: () => {
          if (!playerRef.current) return null;
          const player = playerRef.current.getInternalPlayer() as YouTubePlayer;
          // Update global reference when accessed
          if (player) {
            setGlobalYoutubePlayer(player);
          }
          return player;
        },
        seekTo: (time: number, type: "seconds" | "fraction" = "seconds") => {
          playerRef.current?.seekTo(time, type);
        },
        getCurrentTime: () => {
          return playerRef.current?.getCurrentTime() || 0;
        },
      }),
      [playerRef]
    );

    // Handle player ready event
    const handleReady = () => {
      if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer() as YouTubePlayer;
        if (player) {
          // Update the global player reference
          setGlobalYoutubePlayer(player);
        }
      }
      onReady();
    };

    return (
      <div
        className={`player-wrapper ${
          showVideo ? "h-48 mb-4" : "h-0 overflow-hidden"
        }`}
      >
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          controls={controls}
          onDuration={onDuration}
          onProgress={onProgress}
          onEnded={onEnded}
          onReady={handleReady}
          onError={onError}
          width="100%"
          height="100%"
          style={{ borderRadius: "0.375rem", overflow: "hidden" }}
          config={{
            playerVars: {
              rel: 0, // Don't show related videos
              showinfo: 0, // Hide title and uploader
              modestbranding: 1, // Hide YouTube logo
              iv_load_policy: 3, // Hide annotations
              disablekb: 1, // Disable keyboard shortcuts
              fs: 0, // Disable fullscreen button
            },
            onUnstarted: () => {
              // Handle case where YouTube API fails to auto-play
              if (playing && playerRef.current) {
                try {
                  const player =
                    playerRef.current.getInternalPlayer() as YouTubePlayer;
                  if (player && typeof player.playVideo === "function") {
                    player.playVideo();
                    // Update global reference
                    setGlobalYoutubePlayer(player);
                  }
                } catch (e) {
                  console.error("Error playing video:", e);
                }
              }
            },
          }}
        />
      </div>
    );
  }
);

YoutubePlayer.displayName = "YoutubePlayer";

export default YoutubePlayer;
