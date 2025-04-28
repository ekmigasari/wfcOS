"use client";

import React from "react";
import { Song } from "@/application/atoms/musicPlayerAtom";

interface SongInfoProps {
  currentSong: Song | null;
  isLoading: boolean;
  isWindowOpen: boolean;
  isPlaying: boolean;
}

export const SongInfo = ({
  currentSong,
  isLoading,
  isWindowOpen,
  isPlaying
}: SongInfoProps) => {
  return (
    <h2 className="text-xl font-bold mb-2 truncate">
      {currentSong?.title || "No song selected"}
      {currentSong && (
        <span className="text-sm font-normal ml-2 text-muted-foreground">
          #{currentSong.seqId}
        </span>
      )}
      {isLoading && (
        <span className="text-sm font-normal ml-2 text-amber-500">
          (loading...)
        </span>
      )}
      {!isWindowOpen && isPlaying && (
        <span className="text-sm font-normal ml-2 text-primary">
          (playing in background)
        </span>
      )}
    </h2>
  );
};

export default SongInfo; 