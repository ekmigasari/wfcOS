"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import ReactPlayer from "react-player/youtube";
import {
  Volume2,
  VolumeX,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Video,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  playlistAtom,
  currentSongIndexAtom,
  playingAtom,
  getYoutubeId,
  isWindowOpenAtom,
  currentTimeAtom,
  persistMusicPlayerState,
  volumeAtom,
} from "../../atoms/musicPlayerAtom";
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";

// Define an extended Song interface with a sequence ID
interface Song {
  id: string; // YouTube video ID
  url: string; // YouTube URL
  title: string; // Song title
  seqId: number; // Sequential ID for navigation
}

// Define a YouTube player interface for type safety
interface YouTubePlayerWithMethods {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  [key: string]: unknown; // Replace any with unknown for better type safety
}

// Create a global reference to ensure playback continues when window is closed
let globalYoutubePlayer: YouTubePlayerWithMethods | null = null;

// Flag to track if we're in a page unload state
let isPageUnloading = false;

// Set up beforeunload handler to prevent zombie audio
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isPageUnloading = true;
    if (globalYoutubePlayer) {
      // Stop any playing audio when the page is about to unload
      try {
        if (typeof globalYoutubePlayer.pauseVideo === "function") {
          globalYoutubePlayer.pauseVideo();
        }
      } catch (e) {
        console.error("Error stopping YouTube playback on page unload:", e);
      }
    }
  });
}

const MusicPlayer: React.FC = () => {
  // Global state
  const [playlist, setPlaylist] = useAtom(playlistAtom);
  const [currentSongIndex, setCurrentSongIndex] = useAtom(currentSongIndexAtom);
  const [playing, setPlaying] = useAtom(playingAtom);
  const [isWindowOpen, setIsWindowOpen] = useAtom(isWindowOpenAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [, persistState] = useAtom(persistMusicPlayerState);
  const [volume, setVolume] = useAtom(volumeAtom);

  // Local state
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [newSongUrl, setNewSongUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [nextSeqId, setNextSeqId] = useState(1); // Track the next sequential ID to assign
  const [isLoading, setIsLoading] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  // Volume related state
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Refs
  const playerRef = useRef<ReactPlayer>(null);
  const ignoreEvents = useRef(false);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize the playlist with sequential IDs if they don't exist
  useEffect(() => {
    if (playlist.length > 0 && !("seqId" in playlist[0])) {
      const updatedPlaylist = playlist.map((song, index) => ({
        ...song,
        seqId: index + 1,
      }));
      setPlaylist(updatedPlaylist);
      setNextSeqId(playlist.length + 1);
    } else if (playlist.length === 0) {
      setNextSeqId(1);
    } else {
      // Find the highest seqId to set the nextSeqId correctly
      const maxId = Math.max(
        ...playlist.map((song) => ("seqId" in song ? (song as Song).seqId : 0))
      );
      setNextSeqId(maxId + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Current song - derived state
  const currentSong = playlist[currentSongIndex] || null;

  // Get the current song's sequential ID
  const currentSeqId =
    currentSong && "seqId" in currentSong ? (currentSong as Song).seqId : 0;

  // Initial setup: register player cleanup on mount once
  useEffect(() => {
    const cleanup = () => {
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

          // If we're actually unloading the page, stop the player
          if (isPageUnloading) {
            globalYoutubePlayer.pauseVideo();
            globalYoutubePlayer = null;
          }
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      }
    };

    window.addEventListener("pagehide", cleanup);
    return () => {
      window.removeEventListener("pagehide", cleanup);
    };
  }, [persistState]);

  // Mark window as open when component mounts and closed when unmounted
  useEffect(() => {
    setIsWindowOpen(true);
    persistState({ isWindowOpen: true });

    return () => {
      setIsWindowOpen(false);
      persistState({ isWindowOpen: false });
      // Don't stop playback on unmount - audio will continue in background
    };
  }, [setIsWindowOpen, persistState]);

  // Set up reference to the YouTube player instance
  useEffect(() => {
    const updatePlayerRef = () => {
      if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer();
        if (player) {
          globalYoutubePlayer = player as YouTubePlayerWithMethods;

          // Apply volume settings when player is ready
          if (
            globalYoutubePlayer &&
            typeof globalYoutubePlayer.setVolume === "function"
          ) {
            globalYoutubePlayer.setVolume(isMuted ? 0 : volume * 100);
          }
        }
      }
    };

    // Try immediately
    updatePlayerRef();

    // Also try after a delay to ensure player is ready
    const timer = setTimeout(() => {
      updatePlayerRef();
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialSyncDone, volume, isMuted]);

  // Apply volume changes to the player
  useEffect(() => {
    if (
      globalYoutubePlayer &&
      typeof globalYoutubePlayer.setVolume === "function"
    ) {
      const volumeToSet = isMuted ? 0 : volume * 100;
      globalYoutubePlayer.setVolume(volumeToSet);
    }
  }, [volume, isMuted]);

  // Sync player state when it's ready
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

        // If we have a saved position, seek to it
        if (currentTime > 0) {
          playerRef.current?.seekTo(currentTime, "seconds");
        }

        // Apply volume settings
        const player =
          playerRef.current?.getInternalPlayer() as YouTubePlayerWithMethods;
        if (player && typeof player.setVolume === "function") {
          player.setVolume(isMuted ? 0 : volume * 100);
        }

        // Update playing state based on saved state - but with a delay
        setTimeout(() => {
          try {
            const player =
              playerRef.current?.getInternalPlayer() as YouTubePlayerWithMethods;
            if (player) {
              if (playing) {
                player.playVideo();
              } else {
                player.pauseVideo();
              }
            }

            setIsLoading(false);
            ignoreEvents.current = false;
          } catch (error) {
            console.error("Error applying play/pause state:", error);
            setIsLoading(false);
            ignoreEvents.current = false;
          }
        }, 1000);
      } catch (error) {
        console.error("Error syncing player state:", error);
        setIsLoading(false);
        ignoreEvents.current = false;
      }
    }, 1500);

    return () => {
      clearTimeout(syncTimer);
    };
  }, [
    currentSong,
    currentTime,
    playing,
    initialSyncDone,
    persistState,
    volume,
    isMuted,
  ]);

  // Watch for playing state changes to sync with YouTube player
  useEffect(() => {
    if (!playerRef.current || ignoreEvents.current || !initialSyncDone) return;

    try {
      const player =
        playerRef.current.getInternalPlayer() as YouTubePlayerWithMethods;
      if (player) {
        if (playing) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    } catch (error) {
      console.error("Error applying play/pause state:", error);
    }
  }, [playing, initialSyncDone]);

  // Set up position tracking interval to save current time periodically
  useEffect(() => {
    if (!playerRef.current) return;

    // Save current position function
    const saveCurrentPosition = () => {
      if (playerRef.current && !seeking && playing) {
        const newTime = playerRef.current.getCurrentTime() || 0;
        // Only save if position has changed significantly (> 1 second)
        if (Math.abs(newTime - currentTime) > 1) {
          setCurrentTime(newTime);
          persistState({ currentTime: newTime });
        }
      }
    };

    // Set up an interval to periodically save the current playback position
    timeUpdateInterval.current = setInterval(() => {
      if (playing) {
        saveCurrentPosition();
      }
    }, 5000); // Save position every 5 seconds

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }

      // Save one last time on unmount
      saveCurrentPosition();
    };
  }, [playing, currentTime, setCurrentTime, persistState, seeking]);

  // Handle visibility changes (tab switching, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the page becomes hidden (e.g., switched tabs)
      if (document.visibilityState === "hidden" && !isWindowOpen) {
        // Save the current state
        if (playerRef.current) {
          const newTime = playerRef.current.getCurrentTime() || 0;
          setCurrentTime(newTime);
          persistState({ currentTime: newTime });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWindowOpen, persistState, setCurrentTime]);

  // Handlers
  const handlePlayPause = () => {
    if (ignoreEvents.current) return;

    // Force a short delay to make sure player is ready
    setTimeout(() => {
      const newPlayingState = !playing;
      setPlaying(newPlayingState);
      persistState({ isPlaying: newPlayingState });

      try {
        const player =
          playerRef.current?.getInternalPlayer() as YouTubePlayerWithMethods;
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

  const handleNext = () => {
    if (playlist.length <= 1) return;

    // Find songs with higher seqId, sort by seqId, and take the first one
    const nextSongs = playlist
      .filter((song) => "seqId" in song && (song as Song).seqId > currentSeqId)
      .sort((a, b) => (a as Song).seqId - (b as Song).seqId);

    if (nextSongs.length > 0) {
      // Play the next song in sequence
      const nextSongIndex = playlist.findIndex(
        (song) =>
          "seqId" in song &&
          (song as Song).seqId === (nextSongs[0] as Song).seqId
      );
      setCurrentSongIndex(nextSongIndex);
      persistState({ currentSongIndex: nextSongIndex, currentTime: 0 });
    } else {
      // Cycle back to the lowest seqId if at the end
      const firstSong = [...playlist].sort(
        (a, b) => (a as Song).seqId - (b as Song).seqId
      )[0];

      const firstSongIndex = playlist.findIndex(
        (song) =>
          "seqId" in song && (song as Song).seqId === (firstSong as Song).seqId
      );
      setCurrentSongIndex(firstSongIndex);
      persistState({ currentSongIndex: firstSongIndex, currentTime: 0 });
    }

    // Ensure it starts playing
    setPlaying(true);
    persistState({ isPlaying: true });
  };

  const handlePrevious = () => {
    if (playlist.length <= 1) return;

    // Find songs with lower seqId, sort by seqId (descending), and take the first one
    const prevSongs = playlist
      .filter((song) => "seqId" in song && (song as Song).seqId < currentSeqId)
      .sort((a, b) => (b as Song).seqId - (a as Song).seqId);

    if (prevSongs.length > 0) {
      // Play the previous song in sequence
      const prevSongIndex = playlist.findIndex(
        (song) =>
          "seqId" in song &&
          (song as Song).seqId === (prevSongs[0] as Song).seqId
      );
      setCurrentSongIndex(prevSongIndex);
      persistState({ currentSongIndex: prevSongIndex, currentTime: 0 });
    } else {
      // Cycle to the highest seqId if at the beginning
      const lastSong = [...playlist].sort(
        (a, b) => (b as Song).seqId - (a as Song).seqId
      )[0];

      const lastSongIndex = playlist.findIndex(
        (song) =>
          "seqId" in song && (song as Song).seqId === (lastSong as Song).seqId
      );
      setCurrentSongIndex(lastSongIndex);
      persistState({ currentSongIndex: lastSongIndex, currentTime: 0 });
    }

    // Ensure it starts playing
    setPlaying(true);
    persistState({ isPlaying: true });
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (!seeking) {
      setPlayedSeconds(state.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

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
      setCurrentTime(newTime);
      persistState({ currentTime: newTime });
    }
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSongUrl.trim()) return;

    if (ReactPlayer.canPlay(newSongUrl)) {
      const videoId = getYoutubeId(newSongUrl);

      if (videoId) {
        const title = `YouTube Song (${videoId})`;

        // Create new song with a sequential ID
        const newSong = {
          url: newSongUrl,
          title: title,
          id: videoId,
          seqId: nextSeqId,
        };

        setPlaylist([...playlist, newSong]);
        setNewSongUrl("");
        setNextSeqId((prev) => prev + 1);

        // If first song, select it
        if (playlist.length === 0) {
          setCurrentSongIndex(0);
          persistState({ currentSongIndex: 0 });
        }
      } else {
        alert("Could not extract YouTube video ID");
      }
    } else {
      alert("Invalid or unsupported URL");
    }
  };

  const handleRemoveSong = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();

    if (indexToRemove < 0 || indexToRemove >= playlist.length) return;

    const removedSeqId =
      "seqId" in playlist[indexToRemove]
        ? (playlist[indexToRemove] as Song).seqId
        : 0;

    const newPlaylist = playlist.filter((_, index) => index !== indexToRemove);
    setPlaylist(newPlaylist);

    // Handle index adjustment when the current song is removed
    if (newPlaylist.length === 0) {
      setCurrentSongIndex(0);
      setPlaying(false);
      persistState({ currentSongIndex: 0, isPlaying: false });
    } else if (indexToRemove === currentSongIndex) {
      // Find the next closest song by seqId
      const remainingSeqIds = newPlaylist
        .filter((song) => "seqId" in song)
        .map((song) => (song as Song).seqId);

      if (remainingSeqIds.length > 0) {
        // Find next higher seqId or the lowest if none higher
        const nextHigher = Math.min(
          ...remainingSeqIds.filter((id) => id > removedSeqId)
        );
        const lowestId = Math.min(...remainingSeqIds);

        const targetSeqId = nextHigher !== Infinity ? nextHigher : lowestId;
        const newIndex = newPlaylist.findIndex(
          (song) => "seqId" in song && (song as Song).seqId === targetSeqId
        );

        const updatedIndex = newIndex >= 0 ? newIndex : 0;
        setCurrentSongIndex(updatedIndex);
        persistState({ currentSongIndex: updatedIndex, currentTime: 0 });
      } else {
        setCurrentSongIndex(0);
        persistState({ currentSongIndex: 0, currentTime: 0 });
      }
    } else if (indexToRemove < currentSongIndex) {
      // Adjust current index
      const updatedIndex = currentSongIndex - 1;
      setCurrentSongIndex(updatedIndex);
      persistState({ currentSongIndex: updatedIndex });
    }
  };

  const handleSelectSong = (index: number) => {
    // Don't select if editing
    if (editingIndex !== null) return;

    if (index !== currentSongIndex) {
      setCurrentSongIndex(index);
      setPlaying(true);
      persistState({
        currentSongIndex: index,
        isPlaying: true,
        currentTime: 0,
      });
    } else {
      const newPlayingState = !playing;
      setPlaying(newPlayingState);
      persistState({ isPlaying: newPlayingState });
    }
  };

  const startEditingTitle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditingTitle(playlist[index].title);
  };

  const saveEditedTitle = () => {
    if (editingIndex === null) return;

    const updatedPlaylist = [...playlist];
    updatedPlaylist[editingIndex] = {
      ...updatedPlaylist[editingIndex],
      title: editingTitle.trim() || `Song ${editingIndex + 1}`,
    };

    setPlaylist(updatedPlaylist);
    setEditingIndex(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEditedTitle();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const toggleVideoDisplay = () => {
    setShowVideo(!showVideo);
  };

  // Helper to format time (MM:SS)
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Handlers for volume control
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    persistState({ volume: newVolume });

    // Also update the YouTube player volume directly
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
      setVolume(newVolume);
      persistState({ volume: newVolume });

      // Also update the YouTube player volume directly
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
      persistState({ volume });

      // Also update the YouTube player volume directly
      if (
        globalYoutubePlayer &&
        typeof globalYoutubePlayer.setVolume === "function"
      ) {
        globalYoutubePlayer.setVolume(0);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Player Section */}
      <div
        className={`player-wrapper ${
          showVideo ? "h-48 mb-4" : "h-0 overflow-hidden"
        }`}
      >
        <ReactPlayer
          ref={playerRef}
          url={currentSong?.url}
          playing={playing}
          controls={showVideo}
          onDuration={handleDuration}
          onProgress={handleProgress}
          onEnded={() => {
            if (playlist.length <= 1) {
              setPlaying(false);
              persistState({ isPlaying: false });
            } else {
              handleNext();
            }
          }}
          onReady={() => {
            // Update the global player reference when ready
            if (playerRef.current) {
              globalYoutubePlayer =
                playerRef.current.getInternalPlayer() as YouTubePlayerWithMethods;

              // Set volume when player is ready
              if (typeof globalYoutubePlayer.setVolume === "function") {
                globalYoutubePlayer.setVolume(isMuted ? 0 : volume * 100);
              }

              if (isLoading) {
                setIsLoading(false);
              }
            }
          }}
          onError={(e) => {
            console.error("Player error:", e);
            setIsLoading(false);
          }}
          width="100%"
          height="100%"
          style={{
            borderRadius: "0.375rem",
            overflow: "hidden",
          }}
          config={{
            playerVars: {
              rel: 0, // Disable related videos
              showinfo: 0, // Hide title and uploader
              modestbranding: 1, // Hide YouTube logo
              iv_load_policy: 3, // Hide annotations
              disablekb: 1, // Disable keyboard controls (prevents space bar from activating YouTube UI)
              fs: 0, // Disable fullscreen button
            },
            onUnstarted: () => {
              // Handle case where YouTube API fails to auto-play
              if (playing && playerRef.current) {
                try {
                  const player =
                    playerRef.current.getInternalPlayer() as YouTubePlayerWithMethods;
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
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Song Info & Controls */}
        <div className="mb-4">
          {/* Song Title */}
          <h2 className="text-xl font-bold mb-2 truncate">
            {currentSong?.title || "No song selected"}
            {currentSong && "seqId" in currentSong && (
              <span className="text-sm font-normal ml-2 text-muted-foreground">
                #{(currentSong as Song).seqId}
              </span>
            )}
            {isLoading && (
              <span className="text-sm font-normal ml-2 text-amber-500">
                (loading...)
              </span>
            )}
            {!isWindowOpen && playing && (
              <span className="text-sm font-normal ml-2 text-primary">
                (playing in background)
              </span>
            )}
          </h2>

          {/* Progress Bar with Slider */}
          <div className="mb-2 w-full">
            <div className="flex flex-col space-y-1 w-full">
              {/* Slider */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={playedSeconds}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                disabled={playlist.length === 0 || duration === 0}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
                    (playedSeconds / (duration || 100)) * 100
                  }%, var(--muted) ${
                    (playedSeconds / (duration || 100)) * 100
                  }%, var(--muted) 100%)`,
                }}
              />

              {/* Time Display */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(playedSeconds)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              aria-label="Previous"
              disabled={playlist.length <= 1}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label={playing ? "Pause" : "Play"}
              disabled={playlist.length === 0}
            >
              {playing ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              aria-label="Next"
              disabled={playlist.length <= 1}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8 rounded-full p-0"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />

            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Video Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleVideoDisplay}
              className="px-3 py-1 text-sm rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2"
              disabled={playlist.length === 0}
            >
              <Video className="w-4 h-4" />
              {showVideo ? "Hide Video" : "Show Video"}
            </button>
          </div>
        </div>

        {/* Add Song Form */}
        <form onSubmit={handleAddSong} className="mb-4">
          <div className="flex">
            <input
              type="url"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="flex-grow p-2 rounded-l-md bg-input border border-border focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
              required
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-r-md bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Add
            </button>
          </div>
        </form>

        {/* Playlist */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-medium mb-2 text-foreground">Playlist</h3>
          <div className="overflow-y-auto max-h-[calc(100%-30px)] bg-muted/50 rounded-md">
            {playlist.length > 0 ? (
              <ul>
                {playlist.map((song, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSong(index)}
                    className={`px-3 py-2 cursor-pointer rounded-md hover:bg-muted/80 ${
                      index === currentSongIndex
                        ? "bg-primary/10 font-medium"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {index === currentSongIndex && playing ? (
                          <span className="text-primary flex-shrink-0">
                            <Play className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 flex-shrink-0"></span>
                        )}

                        {editingIndex === index ? (
                          <div className="flex items-center gap-1 flex-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={handleTitleKeyDown}
                              className="p-1 bg-input border border-border rounded text-sm w-full"
                              autoFocus
                            />
                            <button
                              onClick={saveEditedTitle}
                              className="text-primary p-1"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-muted-foreground p-1"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className={`truncate ${
                                index === currentSongIndex ? "text-primary" : ""
                              }`}
                            >
                              {song.title}
                            </span>
                            {"seqId" in song && (
                              <span className="text-xs text-muted-foreground">
                                #{(song as Song).seqId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {editingIndex !== index && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => startEditingTitle(e, index)}
                            className="text-muted-foreground hover:text-primary p-1 rounded-full hover:bg-muted flex-shrink-0"
                            aria-label={`Edit ${song.title}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveSong(e, index)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted flex-shrink-0"
                            aria-label={`Remove ${song.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-muted-foreground text-sm italic">
                Your playlist is empty. Add some songs to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
