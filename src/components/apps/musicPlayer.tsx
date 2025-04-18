"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import ReactPlayer from "react-player/youtube";

import {
  playlistAtom,
  currentSongIndexAtom,
  playingAtom,
  getYoutubeId,
  isWindowOpenAtom,
  currentTimeAtom,
  persistMusicPlayerState,
} from "../../atoms/musicPlayerAtom";

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
  }, [initialSyncDone]);

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
  }, [currentSong, currentTime, playing, initialSyncDone, persistState]);

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.057a1.125 1.125 0 010-1.953l7.108-4.057c.75-.428 1.683.113 1.683.977v8.11zM3 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.057a1.125 1.125 0 010-1.953l7.108-4.057c.75-.428 1.683.113 1.683.977v8.11z"
                />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label={playing ? "Pause" : "Play"}
              disabled={playlist.length === 0}
            >
              {playing ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              aria-label="Next"
              disabled={playlist.length <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8.188c0-.864.933-1.405 1.683-.977l7.108 4.057a1.125 1.125 0 010 1.953l-7.108 4.057A1.125 1.125 0 013 16.813V8.188zm18 0c0-.864.933-1.405 1.683-.977l7.108 4.057a1.125 1.125 0 010 1.953l-7.108 4.057A1.125 1.125 0 0121 16.813V8.188z"
                />
              </svg>
            </button>
          </div>

          {/* Video Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleVideoDisplay}
              className="px-3 py-1 text-sm rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2"
              disabled={playlist.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                                clipRule="evenodd"
                              />
                            </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-muted-foreground p-1"
                              title="Cancel"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleRemoveSong(e, index)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted flex-shrink-0"
                            aria-label={`Remove ${song.title}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
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
