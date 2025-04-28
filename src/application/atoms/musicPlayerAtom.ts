import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

// Feature key for localStorage
const FEATURE_KEY = "musicPlayer";

// Define the Song interface
export interface Song {
  id: string; // YouTube video ID
  url: string; // YouTube URL
  title: string; // Song title
  seqId: number; // Sequential ID for ordering
}

// Default songs to populate the music player
const defaultSongs: Song[] = [
  {
    url: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    title: "Lo-fi Study Session",
    id: "lTRiuFIWV54",
    seqId: 1,
  },
  {
    url: "https://www.youtube.com/watch?v=Fp5ghKduTK8",
    title: "Ghibli Piano",
    id: "Fp5ghKduTK8",
    seqId: 2,
  },
  {
    url: "https://www.youtube.com/watch?v=KxJrYKoTeXA",
    title: "Jazzjeans",
    id: "KxJrYKoTeXA",
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

// Define the MusicPlayerState interface
export interface MusicPlayerState {
  playlist: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  isWindowOpen: boolean;
}

// Initialize with saved state or defaults
const initialMusicPlayerState: MusicPlayerState = (() => {
  const savedState = loadFeatureState<MusicPlayerState>(FEATURE_KEY);

  const defaults: MusicPlayerState = {
    playlist: defaultSongs, // Initialize with default songs
    currentSongIndex: 0,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    isWindowOpen: false,
  };

  return {
    ...defaults,
    ...savedState,
    // Always reset transient states on initialization
    isPlaying: false,
    isWindowOpen: false,
  };
})();

// Create base atom
const baseMusicPlayerAtom = atom<MusicPlayerState>(initialMusicPlayerState);

// Create derived atom for reading state
export const musicPlayerAtom = atom((get) => get(baseMusicPlayerAtom));

// Create derived atom for updating state with persistence
export const updateMusicPlayerStateAtom = atom(
  (get) => get(baseMusicPlayerAtom),
  (get, set, update: Partial<MusicPlayerState>) => {
    const currentState = get(baseMusicPlayerAtom);
    const updatedState = { ...currentState, ...update };

    // Only update and save if state has changed
    if (JSON.stringify(currentState) !== JSON.stringify(updatedState)) {
      set(baseMusicPlayerAtom, updatedState);
      saveFeatureState(FEATURE_KEY, updatedState);
    }
  }
);

// Helper function to extract YouTube ID from URL
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Specific action atoms

// Toggle play/pause
export const togglePlayingAtom = atom(null, (get, set) => {
  const current = get(baseMusicPlayerAtom);
  set(updateMusicPlayerStateAtom, { isPlaying: !current.isPlaying });
});

// Next song
export const nextSongAtom = atom(null, (get, set) => {
  const current = get(baseMusicPlayerAtom);
  if (current.playlist.length <= 1) return;

  const nextIndex = (current.currentSongIndex + 1) % current.playlist.length;
  set(updateMusicPlayerStateAtom, {
    currentSongIndex: nextIndex,
    currentTime: 0,
    isPlaying: true,
  });
});

// Previous song
export const previousSongAtom = atom(null, (get, set) => {
  const current = get(baseMusicPlayerAtom);
  if (current.playlist.length <= 1) return;

  const prevIndex =
    (current.currentSongIndex - 1 + current.playlist.length) %
    current.playlist.length;
  set(updateMusicPlayerStateAtom, {
    currentSongIndex: prevIndex,
    currentTime: 0,
    isPlaying: true,
  });
});

// Update volume
export const setVolumeAtom = atom(null, (get, set, volume: number) => {
  set(updateMusicPlayerStateAtom, { volume });
});

// Add song to playlist
export const addSongAtom = atom(null, (get, set, song: Song) => {
  const current = get(baseMusicPlayerAtom);
  const updatedPlaylist = [...current.playlist, song];
  set(updateMusicPlayerStateAtom, { playlist: updatedPlaylist });
});

// Remove song from playlist
export const removeSongAtom = atom(null, (get, set, index: number) => {
  const current = get(baseMusicPlayerAtom);
  if (index < 0 || index >= current.playlist.length) return;

  const updatedPlaylist = current.playlist.filter((_, i) => i !== index);

  // Adjust currentSongIndex if needed
  let updatedIndex = current.currentSongIndex;
  if (updatedPlaylist.length === 0) {
    updatedIndex = 0;
  } else if (index === current.currentSongIndex) {
    // Select next song or first if at end
    updatedIndex = Math.min(index, updatedPlaylist.length - 1);
  } else if (index < current.currentSongIndex) {
    // Adjust index down by one
    updatedIndex = current.currentSongIndex - 1;
  }

  set(updateMusicPlayerStateAtom, {
    playlist: updatedPlaylist,
    currentSongIndex: updatedIndex,
    // Stop playing if removed current and was playing
    isPlaying: index === current.currentSongIndex ? false : current.isPlaying,
  });
});
