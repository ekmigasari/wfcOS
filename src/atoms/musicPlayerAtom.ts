import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface Song {
  url: string;
  title: string;
  id?: string;
}

const defaultSongs: Song[] = [
  {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    id: "dQw4w9WgXcQ",
  },
  {
    url: "https://www.youtube.com/watch?v=3tmd-ClpJxA",
    title: "Bohemian Rhapsody",
    id: "3tmd-ClpJxA",
  },
  {
    url: "https://www.youtube.com/watch?v=hTWKbfoikeg",
    title: "Uptown Funk",
    id: "hTWKbfoikeg",
  },
  {
    url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    title: "Despacito",
    id: "kJQP7kiw5Fk",
  },
  {
    url: "https://www.youtube.com/watch?v=C0DPdy98e4c",
    title: "Shape of You",
    id: "C0DPdy98e4c",
  },
];

// Persisted atoms
export const playlistAtom = atomWithStorage<Song[]>(
  "musicPlayer_playlist",
  defaultSongs
);
export const currentSongIndexAtom = atomWithStorage<number>(
  "musicPlayer_currentIndex",
  0
);

// Non-persisted atoms for player state
export const playingAtom = atom<boolean>(false);
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

// Action atoms
export const setCurrentSongIndexAtom = atom(null, (get, set, index: number) => {
  const playlist = get(playlistAtom);

  // Validate index
  if (playlist.length === 0) return;

  // Ensure index is within valid range
  const safeIndex =
    ((index % playlist.length) + playlist.length) % playlist.length;
  set(currentSongIndexAtom, safeIndex);
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
