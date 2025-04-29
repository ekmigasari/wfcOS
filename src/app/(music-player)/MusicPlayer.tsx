"use client";

import { useAtom } from "jotai";
import { musicPlayerAtom } from "@/application/atoms/musicPlayerAtom";
import PlayerControls from "./components/PlayerControls";
import PlaylistManager from "./components/PlaylistManager";
import VideoDisplay from "./components/VideoDisplay";
import VolumeControl from "./components/VolumeControl";
import ProgressBar from "./components/ProgressBar";

export const MusicPlayer = () => {
  const [playerState] = useAtom(musicPlayerAtom);

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Video Section */}
      <VideoDisplay isVisible={playerState.showVideo} />

      {/* Main Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Song Info & Controls */}
        <div className="mb-4">
          {/* Song Title */}
          <h2 className="text-xl font-bold mb-2 truncate">
            {playerState.currentSong?.title || "No song selected"}
            {playerState.currentSong && "seqId" in playerState.currentSong && (
              <span className="text-sm font-normal ml-2 text-muted-foreground"></span>
            )}
            {playerState.isLoading && (
              <span className="text-sm font-normal ml-2 text-amber-500">
                (loading...)
              </span>
            )}
          </h2>

          {/* Progress Bar */}
          <ProgressBar />

          {/* Main Controls */}
          <PlayerControls />

          {/* Volume Control */}
          <VolumeControl />
        </div>

        {/* Playlist Section */}
        <PlaylistManager />
      </div>
    </div>
  );
};

export default MusicPlayer;
