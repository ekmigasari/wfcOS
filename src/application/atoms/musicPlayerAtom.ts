import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils"; // Import storage utilities

export interface Song {
  url: string;
  title: string;
  id: string;
  seqId?: number;
}

// Separate atom for frequently changing time state
export const playerTimeAtom = atom({
  currentTime: 0,
  playedSeconds: 0,
  duration: 0,
  seeking: false,
});

// Combine persisted and non-persisted state for the main interface
export interface MusicPlayerState {
  playlist: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  volume: number; // Keep volume persisted
  isLoading: boolean;
  showVideo: boolean;
  isMuted: boolean;
  currentSong: Song | null;
  isWindowOpen: boolean; // Tracks if the window is open or closed
  documentTitle: string; // This is derived, not persisted
}

// Define the shape of the state to be persisted
export interface PersistedMusicPlayerState {
  playlist: Song[];
  currentSongIndex: number;
  volume: number;
  isWindowOpen: boolean;
  // Removed: isPlaying, currentTime - handled differently or derived
}

// Define initial volatile state explicitly for clarity
export interface VolatileMusicPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  showVideo: boolean;
  // isMuted and documentTitle are derived, removed from here
}

// Default songs
const defaultSongs: Song[] = [
  {
    url: "https://www.youtube.com/watch?v=Fp5ghKduTK8",
    title: "Ghibli Piano",
    id: "Fp5ghKduTK8",
    seqId: 1,
  },
  {
    url: "https://www.youtube.com/watch?v=67vdKXlYAZU",
    title: "Jazzjeans",
    id: "67vdKXlYAZU",
    seqId: 2,
  },
  {
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    title: "Lo-fi Study",
    id: "lTRiuFIWV54",
    seqId: 3,
  },

  {
    url: "https://www.youtube.com/watch?v=pfU0QORkRpY",
    title: "FKJ Live",
    id: "pfU0QORkRpY",
    seqId: 4,
  },
  {
    url: "https://www.youtube.com/watch?v=ot5UsNymqgQ",
    title: "Cozy Room",
    id: "ot5UsNymqgQ",
    seqId: 5,
  },
];

// Storage adapter for Jotai
const storage = createJSONStorage<PersistedMusicPlayerState>(
  () => localStorage
);

// Atom with storage for persisted state
export const persistedMusicPlayerAtom =
  atomWithStorage<PersistedMusicPlayerState>(
    "musicPlayer", // Local storage key
    {
      // Initial/default values for persisted state
      playlist: defaultSongs,
      currentSongIndex: 0,
      volume: 0.7,
      isWindowOpen: true,
    },
    storage // Specify the storage adapter
  );

// Atom for non-persisted, derived, or volatile state
export const volatileMusicPlayerAtom = atom<VolatileMusicPlayerState>({
  isPlaying: false,
  isLoading: false,
  showVideo: false,
});

// --- Combined Music Player Atom ---
// This atom combines persisted and volatile state for components to use
export const musicPlayerAtom = atom(
  (
    get
  ): MusicPlayerState & {
    currentTime: number;
    playedSeconds: number;
    duration: number;
    seeking: boolean;
  } => {
    const persisted = get(persistedMusicPlayerAtom);
    const volatile = get(volatileMusicPlayerAtom);
    const time = get(playerTimeAtom);
    const currentSong =
      persisted.playlist.length > persisted.currentSongIndex
        ? persisted.playlist[persisted.currentSongIndex]
        : null;

    // Derive isMuted state
    const isMuted = persisted.volume === 0;

    // Derive document title
    let documentTitle = "wfcOS";
    if (typeof window !== "undefined") {
      // Check if window exists
      if (!persisted.isWindowOpen) {
        if (volatile.isPlaying) {
          documentTitle = `▶️ ${currentSong?.title || "Music"} - wfcOS`;
        } else {
          documentTitle = `⏸️ Music (Paused) - wfcOS`;
        }
      }
      // Update document.title directly here for simplicity, only when it changes
      if (document.title !== documentTitle) {
        document.title = documentTitle;
      }
    }

    return {
      ...persisted,
      ...volatile,
      ...time,
      currentSong,
      isMuted, // Overwrite with derived value
      documentTitle, // Overwrite with derived value
    };
  },
  // Simplified write function: Directs updates to the correct underlying atom
  // This approach avoids complex type inference issues.
  (
    get,
    set,
    update: Partial<
      MusicPlayerState & {
        currentTime: number;
        playedSeconds: number;
        duration: number;
        seeking: boolean;
      }
    >
  ) => {
    const currentPersisted = get(persistedMusicPlayerAtom);
    const currentVolatile = get(volatileMusicPlayerAtom);
    const currentTime = get(playerTimeAtom);

    let persistedChanged = false;
    let volatileChanged = false;
    let timeChanged = false;

    const nextPersisted: PersistedMusicPlayerState = { ...currentPersisted };
    const nextVolatile: VolatileMusicPlayerState = { ...currentVolatile };
    const nextTime: ReturnType<(typeof playerTimeAtom)["read"]> = {
      ...currentTime,
    };

    // Update persisted state
    if (
      update.playlist !== undefined &&
      update.playlist !== currentPersisted.playlist
    ) {
      nextPersisted.playlist = update.playlist;
      persistedChanged = true;
    }
    if (
      update.currentSongIndex !== undefined &&
      update.currentSongIndex !== currentPersisted.currentSongIndex
    ) {
      nextPersisted.currentSongIndex = update.currentSongIndex;
      persistedChanged = true;
    }
    if (
      update.volume !== undefined &&
      update.volume !== currentPersisted.volume
    ) {
      nextPersisted.volume = update.volume;
      persistedChanged = true;
    }
    if (
      update.isWindowOpen !== undefined &&
      update.isWindowOpen !== currentPersisted.isWindowOpen
    ) {
      nextPersisted.isWindowOpen = update.isWindowOpen;
      persistedChanged = true;
    }

    // Update volatile state
    if (
      update.isPlaying !== undefined &&
      update.isPlaying !== currentVolatile.isPlaying
    ) {
      nextVolatile.isPlaying = update.isPlaying;
      volatileChanged = true;
    }
    if (
      update.isLoading !== undefined &&
      update.isLoading !== currentVolatile.isLoading
    ) {
      nextVolatile.isLoading = update.isLoading;
      volatileChanged = true;
    }
    if (
      update.showVideo !== undefined &&
      update.showVideo !== currentVolatile.showVideo
    ) {
      nextVolatile.showVideo = update.showVideo;
      volatileChanged = true;
    }

    // Update time state
    if (
      update.currentTime !== undefined &&
      update.currentTime !== currentTime.currentTime
    ) {
      nextTime.currentTime = update.currentTime;
      timeChanged = true;
    }
    if (
      update.playedSeconds !== undefined &&
      update.playedSeconds !== currentTime.playedSeconds
    ) {
      nextTime.playedSeconds = update.playedSeconds;
      timeChanged = true;
    }
    if (
      update.duration !== undefined &&
      update.duration !== currentTime.duration
    ) {
      nextTime.duration = update.duration;
      timeChanged = true;
    }
    if (
      update.seeking !== undefined &&
      update.seeking !== currentTime.seeking
    ) {
      nextTime.seeking = update.seeking;
      timeChanged = true;
    }

    // Apply updates only if changes occurred
    if (persistedChanged) set(persistedMusicPlayerAtom, nextPersisted);
    if (volatileChanged) set(volatileMusicPlayerAtom, nextVolatile);
    if (timeChanged) set(playerTimeAtom, nextTime);
  }
);

// --- Removed old state/persistence ---
/*
// Get stored state or use defaults (OLD LOGIC - REMOVED)
const getInitialState = () => { ... }

// Main state atom for the music player (OLD ATOM - REMOVED)
export const musicPlayerAtom = atom<MusicPlayerState>(getInitialState());

// Helper to update document title (OLD HELPER - REMOVED, integrated into combined atom)
const updateDocumentTitle = (state: MusicPlayerState): string => { ... };

// Action to persist state changes and handle side effects (OLD ATOM - REMOVED)
export const persistMusicPlayerState = atom(...)
*/

// --- Updated Actions ---
// Actions should now primarily update the specific atoms (persisted, volatile, time)

// Helper to extract YouTube video ID from URL
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- Player Control Actions ---

export const playPauseAtom = atom(null, (get, set) => {
  const currentIsPlaying = get(volatileMusicPlayerAtom).isPlaying;
  set(volatileMusicPlayerAtom, (prev) => ({
    ...prev,
    isPlaying: !currentIsPlaying,
  }));
  // Maybe persist isPlaying state on explicit play/pause? Or only on unload? Let's keep it volatile for now.
});

export const nextSongAtom = atom(null, (get, set) => {
  const persistedState = get(persistedMusicPlayerAtom);
  if (persistedState.playlist.length <= 1) return;

  const nextIndex =
    (persistedState.currentSongIndex + 1) % persistedState.playlist.length;

  set(persistedMusicPlayerAtom, (prev) => ({
    ...prev,
    currentSongIndex: nextIndex,
  }));
  set(playerTimeAtom, {
    currentTime: 0,
    playedSeconds: 0,
    duration: 0,
    seeking: false,
  }); // Reset time
  set(volatileMusicPlayerAtom, (prev) => ({ ...prev, isPlaying: true })); // Auto-play next
});

export const prevSongAtom = atom(null, (get, set) => {
  const persistedState = get(persistedMusicPlayerAtom);
  if (persistedState.playlist.length <= 1) return;

  const prevIndex =
    (persistedState.currentSongIndex - 1 + persistedState.playlist.length) %
    persistedState.playlist.length;

  set(persistedMusicPlayerAtom, (prev) => ({
    ...prev,
    currentSongIndex: prevIndex,
  }));
  set(playerTimeAtom, {
    currentTime: 0,
    playedSeconds: 0,
    duration: 0,
    seeking: false,
  }); // Reset time
  set(volatileMusicPlayerAtom, (prev) => ({ ...prev, isPlaying: true })); // Auto-play prev
});

export const setVolumeAtom = atom(null, (get, set, volume: number) => {
  // Ensure volume is between 0 and 1
  const clampedVolume = Math.max(0, Math.min(1, volume));
  set(persistedMusicPlayerAtom, (prev) => ({ ...prev, volume: clampedVolume }));
});

export const toggleMuteAtom = atom(null, (get, set) => {
  const currentVolume = get(persistedMusicPlayerAtom).volume;
  const newVolume = currentVolume === 0 ? 0.7 : 0;
  set(persistedMusicPlayerAtom, (prev) => ({ ...prev, volume: newVolume }));
});

export const addSongAtom = atom(null, (get, set, song: Song) => {
  set(persistedMusicPlayerAtom, (prev) => {
    const newPlaylist = [...prev.playlist, song];
    // Set current index only if adding the very first song
    const newIndex = newPlaylist.length === 1 ? 0 : prev.currentSongIndex;
    return { ...prev, playlist: newPlaylist, currentSongIndex: newIndex };
  });
});

export const removeSongAtom = atom(null, (get, set, index: number) => {
  const persistedState = get(persistedMusicPlayerAtom);
  if (index < 0 || index >= persistedState.playlist.length) return;

  const newPlaylist = persistedState.playlist.filter((_, i) => i !== index);
  let newIndex = persistedState.currentSongIndex;

  if (newPlaylist.length === 0) {
    newIndex = 0;
    set(volatileMusicPlayerAtom, (prev) => ({ ...prev, isPlaying: false }));
    set(playerTimeAtom, {
      currentTime: 0,
      playedSeconds: 0,
      duration: 0,
      seeking: false,
    });
  } else if (index === persistedState.currentSongIndex) {
    newIndex = Math.min(index, newPlaylist.length - 1);
    // Optionally: reset time or keep playing?
    // set(playerTimeAtom, { currentTime: 0, playedSeconds: 0, duration: 0, seeking: false });
  } else if (index < persistedState.currentSongIndex) {
    newIndex = persistedState.currentSongIndex - 1;
  }

  set(persistedMusicPlayerAtom, (prev) => ({
    ...prev,
    playlist: newPlaylist,
    currentSongIndex: newIndex,
  }));
});

// Atom to handle seek updates - updates the time atom
export const setSeekPositionAtom = atom(null, (get, set, time: number) => {
  // Update time atom, potentially set seeking state
  set(playerTimeAtom, (prev) => ({
    ...prev,
    currentTime: time,
    playedSeconds: time,
    seeking: true,
  }));
  // Seeking should be set back to false by the component handling the seek action when done
});

// Renamed for clarity
export const setPlayerProgressAtom = atom(
  null,
  (
    get,
    set,
    update: { currentTime: number; playedSeconds: number; duration?: number }
  ) => {
    // Only update time, not duration or seeking unless specified
    set(playerTimeAtom, (prev) => ({
      ...prev,
      currentTime: update.currentTime,
      playedSeconds: update.playedSeconds,
      duration: update.duration !== undefined ? update.duration : prev.duration,
      // Seeking is handled by setSeekPositionAtom and the component
    }));
  }
);

// Atom to update player state like duration, seeking (used by the actual player component)
export const updatePlayerInternalsAtom = atom(
  null,
  (get, set, update: Partial<ReturnType<(typeof playerTimeAtom)["read"]>>) => {
    set(playerTimeAtom, (prev) => ({ ...prev, ...update }));
  }
);

export const toggleVideoAtom = atom(null, (get, set) => {
  set(volatileMusicPlayerAtom, (prev) => ({
    ...prev,
    showVideo: !prev.showVideo,
  }));
});

export const updateSongTitleAtom = atom(
  null,
  (get, set, params: { index: number; title: string }) => {
    const { index, title } = params;
    set(persistedMusicPlayerAtom, (prev) => {
      if (index < 0 || index >= prev.playlist.length) return prev;
      const newPlaylist = [...prev.playlist];
      newPlaylist[index] = {
        ...newPlaylist[index],
        title: title.trim() || `Song ${index + 1}`,
      };
      return { ...prev, playlist: newPlaylist };
    });
  }
);

// Atom to handle visibility changes - updates persisted state
export const handleVisibilityChangeAtom = atom(
  null,
  (get, set, isVisible: boolean) => {
    // Update persisted window state
    set(persistedMusicPlayerAtom, (prev) => ({
      ...prev,
      isWindowOpen: isVisible,
    }));
    // No need to trigger volatile update, derived state calculation happens on read
  }
);

// Atom to handle loading state
export const setLoadingAtom = atom(null, (get, set, isLoading: boolean) => {
  set(volatileMusicPlayerAtom, (prev) => ({ ...prev, isLoading }));
});

// Atom to reorder songs in the playlist via drag and drop
export const reorderPlaylistAtom = atom(
  null,
  (get, set, { from, to }: { from: number; to: number }) => {
    const persistedState = get(persistedMusicPlayerAtom);
    if (
      from < 0 ||
      from >= persistedState.playlist.length ||
      to < 0 ||
      to >= persistedState.playlist.length ||
      from === to
    ) {
      return;
    }

    const newPlaylist = [...persistedState.playlist];
    const [movedItem] = newPlaylist.splice(from, 1);
    newPlaylist.splice(to, 0, movedItem);

    // Adjust currentSongIndex if needed
    let newIndex = persistedState.currentSongIndex;
    if (from === persistedState.currentSongIndex) {
      // If we're moving the current song, update the index to its new position
      newIndex = to;
    } else if (
      from < persistedState.currentSongIndex &&
      to >= persistedState.currentSongIndex
    ) {
      // If moving an item from before to after the current song
      newIndex--;
    } else if (
      from > persistedState.currentSongIndex &&
      to <= persistedState.currentSongIndex
    ) {
      // If moving an item from after to before the current song
      newIndex++;
    }

    set(persistedMusicPlayerAtom, (prev) => ({
      ...prev,
      playlist: newPlaylist,
      currentSongIndex: newIndex,
    }));
  }
);

// Atom to sort the playlist by different criteria
export const sortPlaylistAtom = atom(
  null,
  (
    get,
    set,
    {
      sortBy,
      direction,
    }: { sortBy: "title" | "dateAdded" | "reset"; direction: "asc" | "desc" }
  ) => {
    const persistedState = get(persistedMusicPlayerAtom);
    const currentSong =
      persistedState.playlist[persistedState.currentSongIndex];

    let newPlaylist = [...persistedState.playlist];

    if (sortBy === "title") {
      newPlaylist.sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return direction === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "dateAdded") {
      // Sort by seqId (timestamp) if available
      newPlaylist.sort((a, b) => {
        if (a.seqId && b.seqId) {
          const comparison = a.seqId - b.seqId;
          return direction === "asc" ? comparison : -comparison;
        }
        return 0;
      });
    } else if (sortBy === "reset") {
      // Reset to default songs order
      newPlaylist = [...defaultSongs];
    }

    // Find the new index of the current song
    const newIndex = newPlaylist.findIndex(
      (song) => song.id === currentSong.id
    );

    set(persistedMusicPlayerAtom, (prev) => ({
      ...prev,
      playlist: newPlaylist,
      currentSongIndex: newIndex >= 0 ? newIndex : 0,
    }));
  }
);
