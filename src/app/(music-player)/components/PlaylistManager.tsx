"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Check, Pencil, Play, Trash2, X } from "lucide-react";
import {
  musicPlayerAtom,
  persistMusicPlayerState,
  getYoutubeId,
  addSongAtom,
  removeSongAtom,
  updateSongTitleAtom,
} from "@/application/atoms/musicPlayerAtom";
import { Song } from "@/application/atoms/musicPlayerAtom";

const PlaylistManager = () => {
  const [playerState] = useAtom(musicPlayerAtom);
  const [, persistState] = useAtom(persistMusicPlayerState);
  const [, addSong] = useAtom(addSongAtom);
  const [, removeSong] = useAtom(removeSongAtom);
  const [, updateSongTitle] = useAtom(updateSongTitleAtom);

  // Local state
  const [newSongUrl, setNewSongUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Handlers
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSongUrl.trim()) return;

    const videoId = getYoutubeId(newSongUrl);
    if (videoId) {
      const title = `YouTube Song (${videoId})`;

      // Create new song
      const newSong: Song = {
        url: newSongUrl,
        title: title,
        id: videoId,
        seqId: Date.now(), // Use timestamp as a simple unique sequence ID
      };

      addSong(newSong);
      setNewSongUrl("");
    } else {
      alert("Could not extract YouTube video ID");
    }
  };

  const handleRemoveSong = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    removeSong(index);
  };

  const handleSelectSong = (index: number) => {
    // Don't select if editing
    if (editingIndex !== null) return;

    if (index !== playerState.currentSongIndex) {
      persistState({
        currentSongIndex: index,
        isPlaying: true,
        currentTime: 0,
        currentSong: playerState.playlist[index],
      });
    } else {
      persistState({
        isPlaying: !playerState.isPlaying,
      });
    }
  };

  const startEditingTitle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditingTitle(playerState.playlist[index].title);
  };

  const saveEditedTitle = () => {
    if (editingIndex === null) return;

    updateSongTitle({
      index: editingIndex,
      title: editingTitle,
    });

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
    <div className="flex-1 overflow-hidden flex flex-col">
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
          {playerState.playlist.length > 0 ? (
            <ul>
              {playerState.playlist.map((song, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSong(index)}
                  className={`px-3 py-2 cursor-pointer rounded-md hover:bg-muted/80 ${
                    index === playerState.currentSongIndex
                      ? "bg-primary/10 font-medium"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {index === playerState.currentSongIndex &&
                      playerState.isPlaying ? (
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
                              index === playerState.currentSongIndex
                                ? "text-primary"
                                : ""
                            }`}
                          >
                            {song.title}
                          </span>
                          {song.seqId && (
                            <span className="text-xs text-muted-foreground">
                              #{song.seqId}
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
  );
};

export default PlaylistManager;
