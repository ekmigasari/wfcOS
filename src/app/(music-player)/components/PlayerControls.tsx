"use client";

import { useAtom } from "jotai";
import { Play, Pause, SkipBack, SkipForward, Video } from "lucide-react";
import {
  musicPlayerAtom,
  playPauseAtom,
  nextSongAtom,
  prevSongAtom,
  toggleVideoAtom,
} from "@/application/atoms/musicPlayerAtom";

const PlayerControls = () => {
  const [playerState] = useAtom(musicPlayerAtom);
  const [, togglePlay] = useAtom(playPauseAtom);
  const [, nextSong] = useAtom(nextSongAtom);
  const [, prevSong] = useAtom(prevSongAtom);
  const [, toggleVideo] = useAtom(toggleVideoAtom);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Controls */}
      <div className="flex justify-center items-center space-x-4 mb-4">
        <button
          onClick={prevSong}
          className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          aria-label="Previous"
          disabled={playerState.playlist.length <= 1}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label={playerState.isPlaying ? "Pause" : "Play"}
          disabled={playerState.playlist.length === 0}
        >
          {playerState.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={nextSong}
          className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          aria-label="Next"
          disabled={playerState.playlist.length <= 1}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Video Toggle */}
      <div className="flex justify-center">
        <button
          onClick={toggleVideo}
          className="px-3 py-1 text-sm rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2"
          disabled={playerState.playlist.length === 0}
        >
          <Video className="w-4 h-4" />
          {playerState.showVideo ? "Hide Video" : "Show Video"}
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;
