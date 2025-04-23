import { atom } from "jotai";
import { loadFeatureState, saveFeatureState } from "../utils/storage";

interface Song {
  url: string;
  title: string;
  id?: string;
  seqId?: number;
}

const defaultSongs: Song[] = [
  {
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    title: "Lo-fi Study Session",
    id: "lTRiuFIWV54",
  },
  {
    url: "https://www.youtube.com/watch?v=Fp5ghKduTK8",
    title: "Ghibli Piano",
    id: "Fp5ghKduTK8",
  },
  {
    url: "https://www.youtube.com/watch?v=KxJrYKoTeXA",
    title: "Jazzjeans",
    id: "KxJrYKoTeXA",
  },
  {
    url: "https://www.youtube.com/watch?v=pfU0QORkRpY",
    title: "FKJ Live",
    id: "pfU0QORkRpY",
  },
  {
    url: "https://www.youtube.com/watch?v=ot5UsNymqgQ",
    title: "Cozy Room",
    id: "ot5UsNymqgQ",
  },
];

// Get stored state or use defaults
const getInitialState = () => {
  const stored = loadFeatureState<{
    playlist: Song[];
    currentSongIndex: number;
    isPlaying: boolean;
    isWindowOpen: boolean;
    currentTime: number;
    volume: number;
  }>("musicPlayer");

  return {
    playlist: stored?.playlist ?? defaultSongs,
    currentSongIndex: stored?.currentSongIndex ?? 0,
    isPlaying: stored?.isPlaying ?? false,
    isWindowOpen: stored?.isWindowOpen ?? false,
    currentTime: stored?.currentTime ?? 0,
    volume: stored?.volume ?? 0.7,
  };
};

// Persisted atoms
export const playlistAtom = atom<Song[]>(getInitialState().playlist);
export const currentSongIndexAtom = atom<number>(
  getInitialState().currentSongIndex
);
export const playingAtom = atom<boolean>(getInitialState().isPlaying);
export const currentTimeAtom = atom<number>(getInitialState().currentTime);
export const isWindowOpenAtom = atom<boolean>(getInitialState().isWindowOpen);
export const volumeAtom = atom<number>(getInitialState().volume);

// Non-persisted atoms for player state
export const durationAtom = atom<number>(0);
export const playedSecondsAtom = atom<number>(0);
export const seekingAtom = atom<boolean>(false);
export const showVideoAtom = atom<boolean>(false);

// Derived atom to get the current song
export const currentSongAtom = atom<Song | null>((get) => {
  const playlist = get(playlistAtom);
  const index = get(currentSongIndexAtom);

  if (playlist.length === 0) return null;
  return playlist[index] || playlist[0]; // Fallback to first song if index is invalid
});

// Function to persist state changes
export const persistMusicPlayerState = atom(
  (get) => ({
    playlist: get(playlistAtom),
    currentSongIndex: get(currentSongIndexAtom),
    isPlaying: get(playingAtom),
    isWindowOpen: get(isWindowOpenAtom),
    currentTime: get(currentTimeAtom),
    volume: get(volumeAtom),
  }),
  (
    _get,
    set,
    update: Partial<{
      playlist: Song[];
      currentSongIndex: number;
      isPlaying: boolean;
      currentTime: number;
      isWindowOpen: boolean;
      volume: number;
    }>
  ) => {
    if (update.playlist !== undefined) {
      set(playlistAtom, update.playlist);
    }
    if (update.currentSongIndex !== undefined) {
      set(currentSongIndexAtom, update.currentSongIndex);
    }
    if (update.isPlaying !== undefined) {
      set(playingAtom, update.isPlaying);
    }
    if (update.currentTime !== undefined) {
      set(currentTimeAtom, update.currentTime);
    }
    if (update.isWindowOpen !== undefined) {
      set(isWindowOpenAtom, update.isWindowOpen);
    }
    if (update.volume !== undefined) {
      set(volumeAtom, update.volume);
    }

    // Save to local storage
    const currentState = {
      playlist:
        update.playlist !== undefined ? update.playlist : _get(playlistAtom),
      currentSongIndex:
        update.currentSongIndex !== undefined
          ? update.currentSongIndex
          : _get(currentSongIndexAtom),
      isPlaying:
        update.isPlaying !== undefined ? update.isPlaying : _get(playingAtom),
      isWindowOpen:
        update.isWindowOpen !== undefined
          ? update.isWindowOpen
          : _get(isWindowOpenAtom),
      currentTime:
        update.currentTime !== undefined
          ? update.currentTime
          : _get(currentTimeAtom),
      volume: update.volume !== undefined ? update.volume : _get(volumeAtom),
    };

    saveFeatureState("musicPlayer", currentState);
  }
);

// Action atoms
export const setCurrentSongIndexAtom = atom(null, (get, set, index: number) => {
  const playlist = get(playlistAtom);

  // Validate index
  if (playlist.length === 0) return;

  // Ensure index is within valid range
  const safeIndex =
    ((index % playlist.length) + playlist.length) % playlist.length;
  set(currentSongIndexAtom, safeIndex);

  // Also persist the change
  const currentState = {
    playlist: get(playlistAtom),
    currentSongIndex: safeIndex,
    isPlaying: get(playingAtom),
    isWindowOpen: get(isWindowOpenAtom),
    currentTime: 0, // Reset time when changing song
  };
  saveFeatureState("musicPlayer", currentState);
});

export const nextSongAtom = atom(null, (get, set) => {
  const playlist = get(playlistAtom);
  const currentIndex = get(currentSongIndexAtom);

  if (playlist.length <= 1) return; // No next song if only one or no songs

  const nextIndex = (currentIndex + 1) % playlist.length;
  set(currentSongIndexAtom, nextIndex);
});

export const previousSongAtom = atom(null, (get, set) => {
  const playlist = get(playlistAtom);
  const currentIndex = get(currentSongIndexAtom);

  if (playlist.length <= 1) return; // No previous song if only one or no songs

  const prevIndex =
    (((currentIndex - 1) % playlist.length) + playlist.length) %
    playlist.length;
  set(currentSongIndexAtom, prevIndex);
});

export const addSongAtom = atom(null, (get, set, newSong: Song) => {
  const playlist = get(playlistAtom);
  set(playlistAtom, [...playlist, newSong]);

  // If this is the first song, select it
  if (playlist.length === 0) {
    set(currentSongIndexAtom, 0);
  }
});

export const removeSongAtom = atom(null, (get, set, indexToRemove: number) => {
  const playlist = get(playlistAtom);
  const currentIndex = get(currentSongIndexAtom);

  if (indexToRemove < 0 || indexToRemove >= playlist.length) return;

  const newPlaylist = playlist.filter((_, index) => index !== indexToRemove);
  set(playlistAtom, newPlaylist);

  // Adjust current index if needed
  if (newPlaylist.length === 0) {
    set(currentSongIndexAtom, 0);
    set(playingAtom, false);
  } else if (indexToRemove === currentIndex) {
    // Currently playing song was removed
    if (currentIndex >= newPlaylist.length) {
      // If we removed the last song and were playing it, go to the new last song
      set(currentSongIndexAtom, newPlaylist.length - 1);
    }
    // Otherwise keep the same index (next song automatically becomes current)
  } else if (indexToRemove < currentIndex) {
    // If we removed a song before the current one, adjust the index
    set(currentSongIndexAtom, currentIndex - 1);
  }
});

export const updateSongTitleAtom = atom(
  null,
  (get, set, params: { index: number; title: string }) => {
    const { index, title } = params;
    const playlist = get(playlistAtom);

    if (index < 0 || index >= playlist.length) return;

    const updatedPlaylist = [...playlist];
    updatedPlaylist[index] = {
      ...updatedPlaylist[index],
      title: title.trim() || `Song ${index + 1}`, // Fallback if empty
    };

    set(playlistAtom, updatedPlaylist);
  }
);

// Helper to extract YouTube video ID from URL
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};
