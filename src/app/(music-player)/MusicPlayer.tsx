"use client";

import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { musicPlayerAtom } from "@/application/atoms/musicPlayerAtom";
import { useOnlineStatus } from "@/application/hooks";
import PlayerControls from "./components/PlayerControls";
import PlaylistManager from "./components/PlaylistManager";
import ProgressBar from "./components/ProgressBar";
import VolumeControl from "./components/VolumeControl";

const VideoDisplay = dynamic(() => import("./components/VideoDisplay"), {
  ssr: false,
});

export const MusicPlayer = () => {
  const [playerState] = useAtom(musicPlayerAtom);
  const { isOnline } = useOnlineStatus();

  return (
    <div className="flex flex-col bg-card text-card-foreground">
      {/* Video Section */}
      {playerState.currentSong ? (
        <VideoDisplay isVisible={playerState.showVideo} />
      ) : null}

      {/* Main Content Section */}
      <div className="flex flex-col p-4">
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

          {!isOnline ? (
            <p className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              Music streaming is online-only right now. Your playlist stays
              saved locally, but playback needs internet.
            </p>
          ) : null}

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
