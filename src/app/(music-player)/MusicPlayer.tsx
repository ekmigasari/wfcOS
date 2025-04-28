"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  updateMusicPlayerStateAtom,
  Song,
} from "@/application/atoms/musicPlayerAtom";

// Import sub-components
import YoutubePlayer, {
  PlayerRef,
  YouTubePlayer,
} from "./components/YoutubePlayer";
import PlayerControls from "./components/PlayerControls";
import ProgressBar from "./components/ProgressBar";
import VolumeControl from "./components/VolumeControl";
import VideoToggle from "./components/VideoToggle";
import AddSongForm from "./components/AddSongForm";
import Playlist from "./components/Playlist";
import SongInfo from "./components/SongInfo";

// Global player reference for background playback
export let globalYoutubePlayer: YouTubePlayer | null = null;
export const setGlobalYoutubePlayer = (player: YouTubePlayer | null) => {
  globalYoutubePlayer = player;
};
let isPageUnloading = false;

// Set up beforeunload handler to prevent audio issues
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isPageUnloading = true;
    if (globalYoutubePlayer) {
      try {
        globalYoutubePlayer.pauseVideo();
      } catch (e) {
        console.error("Error stopping YouTube playback:", e);
      }
    }
  });
}

export const MusicPlayer: React.FC<{ windowId?: string }> = () => {
  // Global state
  const [state, updateMusicPlayerState] = useAtom(updateMusicPlayerStateAtom);

  const {
    playlist,
    currentSongIndex,
    isPlaying,
    volume,
    currentTime,
    isWindowOpen,
  } = state;

  // Local state
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(currentTime || 0);
  const [seeking, setSeeking] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const playerRef = useRef<PlayerRef>(null);
  const ignoreEvents = useRef(false);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Current song (derived state)
  const currentSong = playlist[currentSongIndex];

  // Mark window as open and set up cleanup
  useEffect(() => {
    updateMusicPlayerState({ isWindowOpen: true });

    return () => {
      updateMusicPlayerState({ isWindowOpen: false });
      // Don't stop playback on unmount - audio continues in background
    };
  }, [updateMusicPlayerState]);

  // Set up YouTube player reference
  useEffect(() => {
    const updatePlayerRef = () => {
      if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer();
        if (player) {
          globalYoutubePlayer = player;

          // Apply volume on player ready
          if (
            globalYoutubePlayer &&
            typeof globalYoutubePlayer.setVolume === "function"
          ) {
            globalYoutubePlayer.setVolume(isMuted ? 0 : volume * 100);
          }
        }
      }
    };

    // Try immediately and after a delay for reliability
    updatePlayerRef();
    const timer = setTimeout(updatePlayerRef, 1000);

    return () => clearTimeout(timer);
  }, [initialSyncDone, volume, isMuted]);

  // Apply volume changes
  useEffect(() => {
    if (
      globalYoutubePlayer &&
      typeof globalYoutubePlayer.setVolume === "function"
    ) {
      globalYoutubePlayer.setVolume(isMuted ? 0 : volume * 100);
    }
  }, [volume, isMuted]);

  // Sync player with stored state
  useEffect(() => {
    if (
      !playerRef.current ||
      isPageUnloading ||
      initialSyncDone ||
      !currentSong
    )
      return;

    const syncTimer = setTimeout(() => {
      try {
        setInitialSyncDone(true);
        setIsLoading(true);
        ignoreEvents.current = true;

        // Seek to saved position
        if (currentTime > 0) {
          playerRef.current?.seekTo(currentTime, "seconds");
        }

        // Apply volume
        const player = playerRef.current?.getInternalPlayer();
        if (player && typeof player.setVolume === "function") {
          player.setVolume(isMuted ? 0 : volume * 100);
        }

        // Apply playing state with delay
        setTimeout(() => {
          try {
            const player = playerRef.current?.getInternalPlayer();
            if (player) {
              if (isPlaying) {
                player.playVideo();
              } else {
                player.pauseVideo();
              }
            }

            setIsLoading(false);
            ignoreEvents.current = false;
          } catch (error) {
            console.error("Error applying play state:", error);
            setIsLoading(false);
            ignoreEvents.current = false;
          }
        }, 1000);
      } catch (error) {
        console.error("Error syncing player:", error);
        setIsLoading(false);
        ignoreEvents.current = false;
      }
    }, 1500);

    return () => clearTimeout(syncTimer);
  }, [
    currentSong,
    currentTime,
    isPlaying,
    initialSyncDone,
    volume,
    isMuted,
    updateMusicPlayerState,
  ]);

  // Watch for playing state changes
  useEffect(() => {
    if (!playerRef.current || ignoreEvents.current || !initialSyncDone) return;

    try {
      const player = playerRef.current.getInternalPlayer();
      if (player) {
        if (isPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    } catch (error) {
      console.error("Error applying play state:", error);
    }
  }, [isPlaying, initialSyncDone]);

  // Set up position tracking interval
  useEffect(() => {
    if (!playerRef.current) return;

    // Save current position function
    const saveCurrentPosition = () => {
      if (playerRef.current && !seeking && isPlaying) {
        const newTime = playerRef.current.getCurrentTime() || 0;
        // Only save if changed significantly
        if (Math.abs(newTime - currentTime) > 1) {
          updateMusicPlayerState({ currentTime: newTime });
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
  }, [isPlaying, currentTime, updateMusicPlayerState, seeking]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isWindowOpen) {
        if (playerRef.current) {
          const newTime = playerRef.current.getCurrentTime() || 0;
          updateMusicPlayerState({ currentTime: newTime });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWindowOpen, updateMusicPlayerState]);

  // Clean up player on component unmount
  useEffect(() => {
    return () => {
      if (
        isPageUnloading &&
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.pauseVideo === "function"
      ) {
        try {
          globalYoutubePlayer.pauseVideo();
          globalYoutubePlayer = null;
        } catch (e) {
          console.error("Error cleaning up player:", e);
        }
      }
    };
  }, []);

  // PlayPause handler
  const handlePlayPause = () => {
    if (ignoreEvents.current) return;

    setTimeout(() => {
      const newPlayingState = !isPlaying;
      updateMusicPlayerState({ isPlaying: newPlayingState });

      try {
        const player = playerRef.current?.getInternalPlayer();
        if (player) {
          if (newPlayingState) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        }
      } catch (error) {
        console.error("Error toggling play state:", error);
      }
    }, 50);
  };

  // Next song handler
  const handleNext = () => {
    if (playlist.length <= 1) return;

    // Find songs with higher seqId
    const currentSeqId = currentSong?.seqId || 0;
    const nextSongs = playlist
      .filter((song: Song) => song.seqId > currentSeqId)
      .sort((a: Song, b: Song) => a.seqId - b.seqId);

    if (nextSongs.length > 0) {
      // Play next song in sequence
      const nextSongIndex = playlist.findIndex(
        (song: Song) => song.seqId === nextSongs[0].seqId
      );
      updateMusicPlayerState({
        currentSongIndex: nextSongIndex,
        currentTime: 0,
        isPlaying: true,
      });
    } else {
      // Cycle back to lowest seqId
      const firstSong = [...playlist].sort(
        (a: Song, b: Song) => a.seqId - b.seqId
      )[0];
      const firstSongIndex = playlist.findIndex(
        (song: Song) => song.seqId === firstSong.seqId
      );
      updateMusicPlayerState({
        currentSongIndex: firstSongIndex,
        currentTime: 0,
        isPlaying: true,
      });
    }
  };

  // Previous song handler
  const handlePrevious = () => {
    if (playlist.length <= 1) return;

    // Find songs with lower seqId
    const currentSeqId = currentSong?.seqId || 0;
    const prevSongs = playlist
      .filter((song: Song) => song.seqId < currentSeqId)
      .sort((a: Song, b: Song) => b.seqId - a.seqId);

    if (prevSongs.length > 0) {
      // Play previous song in sequence
      const prevSongIndex = playlist.findIndex(
        (song: Song) => song.seqId === prevSongs[0].seqId
      );
      updateMusicPlayerState({
        currentSongIndex: prevSongIndex,
        currentTime: 0,
        isPlaying: true,
      });
    } else {
      // Cycle to highest seqId
      const lastSong = [...playlist].sort(
        (a: Song, b: Song) => b.seqId - a.seqId
      )[0];
      const lastSongIndex = playlist.findIndex(
        (song: Song) => song.seqId === lastSong.seqId
      );
      updateMusicPlayerState({
        currentSongIndex: lastSongIndex,
        currentTime: 0,
        isPlaying: true,
      });
    }
  };

  // Progress handler
  const handleProgress = (state: { playedSeconds: number }) => {
    if (!seeking) {
      setPlayedSeconds(state.playedSeconds);
    }
  };

  // Duration handler
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Seek handlers
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setPlayedSeconds(newTime);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, "seconds");
      updateMusicPlayerState({ currentTime: newTime });
    }
  };

  // Remove song handler
  const handleRemoveSong = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();

    if (indexToRemove < 0 || indexToRemove >= playlist.length) return;

    const removedSeqId = playlist[indexToRemove].seqId;
    const newPlaylist = playlist.filter(
      (_: Song, index: number) => index !== indexToRemove
    );

    // Handle index adjustment when removing current song
    if (newPlaylist.length === 0) {
      updateMusicPlayerState({
        playlist: newPlaylist,
        currentSongIndex: 0,
        isPlaying: false,
      });
    } else if (indexToRemove === currentSongIndex) {
      // Find next closest song by seqId
      const remainingSeqIds = newPlaylist.map((song: Song) => song.seqId);

      if (remainingSeqIds.length > 0) {
        // Find next higher seqId or the lowest if none higher
        const nextHigher = Math.min(
          ...remainingSeqIds.filter((id: number) => id > removedSeqId),
          Infinity
        );
        const lowestId = Math.min(...remainingSeqIds);

        const targetSeqId = nextHigher !== Infinity ? nextHigher : lowestId;
        const newIndex = newPlaylist.findIndex(
          (song: Song) => song.seqId === targetSeqId
        );

        const updatedIndex = newIndex >= 0 ? newIndex : 0;
        updateMusicPlayerState({
          playlist: newPlaylist,
          currentSongIndex: updatedIndex,
          currentTime: 0,
        });
      } else {
        updateMusicPlayerState({
          playlist: newPlaylist,
          currentSongIndex: 0,
          currentTime: 0,
        });
      }
    } else if (indexToRemove < currentSongIndex) {
      // Adjust current index down by one
      updateMusicPlayerState({
        playlist: newPlaylist,
        currentSongIndex: currentSongIndex - 1,
      });
    } else {
      updateMusicPlayerState({ playlist: newPlaylist });
    }
  };

  // Song selection handler
  const handleSelectSong = (index: number) => {
    if (index !== currentSongIndex) {
      updateMusicPlayerState({
        currentSongIndex: index,
        isPlaying: true,
        currentTime: 0,
      });
    } else {
      updateMusicPlayerState({ isPlaying: !isPlaying });
    }
  };

  // Video display toggle
  const toggleVideoDisplay = () => {
    setShowVideo(!showVideo);
  };

  // Volume control handlers
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setIsMuted(newVolume === 0);
    updateMusicPlayerState({ volume: newVolume });

    // Update YouTube player volume directly
    if (
      globalYoutubePlayer &&
      typeof globalYoutubePlayer.setVolume === "function"
    ) {
      globalYoutubePlayer.setVolume(newVolume * 100);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute
      setIsMuted(false);
      const newVolume = prevVolume > 0 ? prevVolume : 0.5;
      updateMusicPlayerState({ volume: newVolume });

      // Update YouTube player volume directly
      if (
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.setVolume === "function"
      ) {
        globalYoutubePlayer.setVolume(newVolume * 100);
      }
    } else {
      // Mute
      setPrevVolume(volume);
      setIsMuted(true);

      // Update YouTube player volume directly
      if (
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.setVolume === "function"
      ) {
        globalYoutubePlayer.setVolume(0);
      }
    }
  };

  // Player ready handler
  const handlePlayerReady = () => {
    // Update global player reference
    if (playerRef.current) {
      globalYoutubePlayer = playerRef.current.getInternalPlayer();

      // Set volume when player is ready
      if (
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.setVolume === "function"
      ) {
        globalYoutubePlayer.setVolume(isMuted ? 0 : volume * 100);
      }

      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  // Player error handler
  const handlePlayerError = (error: Error) => {
    console.error("Player error:", error);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Player Section */}
      <YoutubePlayer
        ref={playerRef}
        url={currentSong?.url}
        playing={isPlaying}
        controls={showVideo}
        showVideo={showVideo}
        volume={volume}
        isMuted={isMuted}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onEnded={() => {
          if (playlist.length <= 1) {
            updateMusicPlayerState({ isPlaying: false });
          } else {
            handleNext();
          }
        }}
        onReady={handlePlayerReady}
        onError={handlePlayerError}
      />

      {/* Main Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Song Info & Controls */}
        <div className="mb-4">
          {/* Song Title */}
          <SongInfo
            currentSong={currentSong}
            isLoading={isLoading}
            isWindowOpen={isWindowOpen}
            isPlaying={isPlaying}
          />

          {/* Progress Bar */}
          <ProgressBar
            playedSeconds={playedSeconds}
            duration={duration}
            handleSeekChange={handleSeekChange}
            handleSeekMouseDown={handleSeekMouseDown}
            handleSeekMouseUp={handleSeekMouseUp}
            disabled={playlist.length === 0 || duration === 0}
          />

          {/* Main Controls */}
          <PlayerControls
            handlePrevious={handlePrevious}
            handlePlayPause={handlePlayPause}
            handleNext={handleNext}
          />

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            handleVolumeChange={handleVolumeChange}
            toggleMute={toggleMute}
          />

          {/* Video Toggle */}
          <VideoToggle
            showVideo={showVideo}
            toggleVideoDisplay={toggleVideoDisplay}
            disabled={playlist.length === 0}
          />
        </div>

        {/* Add Song Form */}
        <AddSongForm />

        {/* Playlist */}
        <Playlist
          handleSelectSong={handleSelectSong}
          handleRemoveSong={handleRemoveSong}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
