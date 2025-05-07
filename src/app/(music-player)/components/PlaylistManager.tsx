"use client";

import { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  Check,
  Pencil,
  Play,
  Pause,
  Trash2,
  X,
  GripVertical,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Plus,
} from "lucide-react";
import {
  musicPlayerAtom,
  getYoutubeId,
  addSongAtom,
  removeSongAtom,
  updateSongTitleAtom,
  playPauseAtom,
  persistedMusicPlayerAtom,
  playerTimeAtom,
  volatileMusicPlayerAtom,
  reorderPlaylistAtom,
  sortPlaylistAtom,
  type PersistedMusicPlayerState,
  type VolatileMusicPlayerState,
} from "@/application/atoms/musicPlayerAtom";
import { Song } from "@/application/atoms/musicPlayerAtom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Song Item Component Props
interface SortableSongItemProps {
  song: Song;
  index: number;
  isCurrentSong: number;
  isPlaying: boolean;
  editingIndex: number | null;
  editingTitle: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSong: (index: number) => void;
  onStartEditing: (e: React.MouseEvent, index: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveSong: (e: React.MouseEvent, index: number) => void;
  onTitleKeyDown: (e: React.KeyboardEvent) => void;
}

// Sortable Song Item Component
const SortableSongItem = ({
  song,
  index,
  isCurrentSong,
  isPlaying,
  editingIndex,
  editingTitle,
  onTitleChange,
  onSelectSong,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onRemoveSong,
  onTitleKeyDown,
}: SortableSongItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${song.id}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectSong(index)}
      className={`px-3 py-2 cursor-pointer rounded-md hover:bg-muted/80 ${
        index === isCurrentSong ? "bg-primary/10 font-medium" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {index === isCurrentSong ? (
            isPlaying ? (
              <span className="text-primary flex-shrink-0">
                <Play className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-muted-foreground flex-shrink-0">
                <Pause className="w-4 h-4" />
              </span>
            )
          ) : (
            <span className="w-4 h-4 flex-shrink-0"></span>
          )}

          {editingIndex === index ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editingTitle}
                onChange={onTitleChange}
                onKeyDown={onTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="p-1 bg-input border border-border rounded text-sm w-full"
                autoFocus
              />
              <button
                onClick={onSaveEdit}
                className="text-primary p-1"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
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
                  index === isCurrentSong ? "text-primary" : ""
                }`}
                title={song.title}
              >
                {song.title}
              </span>
            </div>
          )}
        </div>

        {editingIndex !== index && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => onStartEditing(e, index)}
              className="text-muted-foreground hover:text-primary p-1 rounded-full hover:bg-muted flex-shrink-0"
              aria-label={`Edit ${song.title}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => onRemoveSong(e, index)}
              className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted flex-shrink-0"
              aria-label={`Remove ${song.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

const PlaylistManager = () => {
  const [playerState] = useAtom(musicPlayerAtom);
  const addSong = useSetAtom(addSongAtom);
  const removeSong = useSetAtom(removeSongAtom);
  const updateSongTitle = useSetAtom(updateSongTitleAtom);
  const togglePlayPause = useSetAtom(playPauseAtom);
  const setPersistedState = useSetAtom(persistedMusicPlayerAtom);
  const setVolatileState = useSetAtom(volatileMusicPlayerAtom);
  const setPlayerTime = useSetAtom(playerTimeAtom);
  const reorderPlaylist = useSetAtom(reorderPlaylistAtom);
  const sortPlaylist = useSetAtom(sortPlaylistAtom);

  // Local state
  const [newSongUrl, setNewSongUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [activeSortType, setActiveSortType] = useState<
    "title" | "dateAdded" | "reset" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Find indices from the IDs (format: "${song.id}-${index}")
      const activeIndex = parseInt(activeId.split("-").pop() || "0", 10);
      const overIndex = parseInt(overId.split("-").pop() || "0", 10);

      // Reorder in atom
      reorderPlaylist({ from: activeIndex, to: overIndex });
    }
  };

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
    if (editingIndex !== null) return;

    if (index !== playerState.currentSongIndex) {
      setPersistedState((prev: PersistedMusicPlayerState) => ({
        ...prev,
        currentSongIndex: index,
      }));
      setPlayerTime({
        currentTime: 0,
        playedSeconds: 0,
        duration: 0,
        seeking: false,
      });
      setVolatileState((prev: VolatileMusicPlayerState) => ({
        ...prev,
        isPlaying: true,
      }));
    } else {
      togglePlayPause();
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

  const handleSortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSortMenuOpen(!sortMenuOpen);
  };

  const handleSort = (sortType: "title" | "dateAdded" | "reset") => {
    // Toggle sort direction if clicking the same sort type
    const newDirection =
      sortType === activeSortType && sortType !== "reset"
        ? sortDirection === "asc"
          ? "desc"
          : "asc"
        : "asc";

    // Update the active sort type and direction
    setActiveSortType(sortType === "reset" ? null : sortType);
    setSortDirection(newDirection);

    // Apply the sort
    sortPlaylist({ sortBy: sortType, direction: newDirection });
    setSortMenuOpen(false);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Add Song Form */}
      <form onSubmit={handleAddSong} className="mb-4">
        <div className="flex ">
          <input
            type="url"
            value={newSongUrl}
            onChange={(e) => setNewSongUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-grow min-w-0 p-2 rounded-l-md bg-input border border-border focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
            required
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-r-md bg-accent hover:bg-accent/90 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Playlist Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-foreground">Playlist</h3>
        <div className="relative">
          <button
            onClick={handleSortClick}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md text-muted-foreground"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>
              {activeSortType
                ? `Sorted by ${
                    activeSortType === "dateAdded" ? "Date" : "Title"
                  }`
                : "Sort"}
            </span>
            {activeSortType &&
              (sortDirection === "asc" ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              ))}
          </button>

          {sortMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-md shadow-md z-10">
              <ul className="py-1">
                <li
                  className={`flex justify-between items-center px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    activeSortType === "title" ? "bg-accent/20" : ""
                  }`}
                  onClick={() => handleSort("title")}
                >
                  <span>Sort by Title</span>
                  {activeSortType === "title" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    ))}
                </li>
                <li
                  className={`flex justify-between items-center px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    activeSortType === "dateAdded" ? "bg-accent/20" : ""
                  }`}
                  onClick={() => handleSort("dateAdded")}
                >
                  <span>Sort by Date Added</span>
                  {activeSortType === "dateAdded" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    ))}
                </li>
                {/* on/off disable
                <li
                  className="px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => handleSort("reset")}
                >
                  Reset to Default
                </li> */}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100%-30px)] bg-muted/50 rounded-md">
          {playerState.playlist.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playerState.playlist.map(
                  (song, index) => `${song.id}-${index}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {playerState.playlist.map((song, index) => (
                    <SortableSongItem
                      key={`${song.id}-${index}`}
                      song={song}
                      index={index}
                      isCurrentSong={playerState.currentSongIndex}
                      isPlaying={playerState.isPlaying}
                      editingIndex={editingIndex}
                      editingTitle={editingTitle}
                      onTitleChange={(e) => setEditingTitle(e.target.value)}
                      onSelectSong={handleSelectSong}
                      onStartEditing={startEditingTitle}
                      onSaveEdit={saveEditedTitle}
                      onCancelEdit={cancelEditing}
                      onRemoveSong={handleRemoveSong}
                      onTitleKeyDown={handleTitleKeyDown}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
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
