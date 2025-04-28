"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import { Play, Pencil, Trash2, Check, X } from "lucide-react";
import {
  musicPlayerAtom,
  updateMusicPlayerStateAtom,
  Song,
} from "@/application/atoms/musicPlayerAtom";

interface PlaylistProps {
  handleSelectSong: (index: number) => void;
  handleRemoveSong: (e: React.MouseEvent, index: number) => void;
}

export const Playlist = ({
  handleSelectSong,
  handleRemoveSong,
}: PlaylistProps) => {
  const [state] = useAtom(musicPlayerAtom);
  const [, updateMusicPlayerState] = useAtom(updateMusicPlayerStateAtom);
  const { playlist, currentSongIndex, isPlaying } = state;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Title editing handlers
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

    updateMusicPlayerState({ playlist: updatedPlaylist });
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

  return (
    <div className="flex-1 overflow-hidden">
      <h3 className="text-sm font-medium mb-2 text-foreground">Playlist</h3>
      <div className="overflow-y-auto max-h-[calc(100%-30px)] bg-muted/50 rounded-md">
        {playlist.length > 0 ? (
          <ul>
            {playlist.map((song: Song, index: number) => (
              <li
                key={index}
                onClick={() => handleSelectSong(index)}
                className={`px-3 py-2 cursor-pointer rounded-md hover:bg-muted/80 ${
                  index === currentSongIndex ? "bg-primary/10 font-medium" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {index === currentSongIndex && isPlaying ? (
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
                        <span className="text-xs text-muted-foreground">
                          #{song.seqId}
                        </span>
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
  );
};

export default Playlist;
