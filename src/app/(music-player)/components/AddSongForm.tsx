"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import {
  musicPlayerAtom,
  updateMusicPlayerStateAtom,
} from "@/application/atoms/musicPlayerAtom";
import { getYoutubeId, createSongTitle } from "../utils/playerUtils";
import ReactPlayer from "react-player/youtube";

export const AddSongForm = () => {
  const [state] = useAtom(musicPlayerAtom);
  const [, updateMusicPlayerState] = useAtom(updateMusicPlayerStateAtom);
  const [newSongUrl, setNewSongUrl] = useState("");

  // Find the next sequential ID for new songs
  const getNextSeqId = (): number => {
    if (state.playlist.length === 0) return 1;
    return Math.max(...state.playlist.map((song) => song.seqId)) + 1;
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSongUrl.trim()) return;

    if (ReactPlayer.canPlay(newSongUrl)) {
      const videoId = getYoutubeId(newSongUrl);

      if (videoId) {
        const title = createSongTitle(videoId);
        const nextSeqId = getNextSeqId();

        // Create new song with sequential ID
        const newSong = {
          url: newSongUrl,
          title: title,
          id: videoId,
          seqId: nextSeqId,
        };

        const updatedPlaylist = [...state.playlist, newSong];
        updateMusicPlayerState({ playlist: updatedPlaylist });
        setNewSongUrl("");

        // If first song, select it
        if (state.playlist.length === 0) {
          updateMusicPlayerState({ currentSongIndex: 0 });
        }
      } else {
        alert("Could not extract YouTube video ID");
      }
    } else {
      alert("Invalid or unsupported URL");
    }
  };

  return (
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
  );
};

export default AddSongForm;
