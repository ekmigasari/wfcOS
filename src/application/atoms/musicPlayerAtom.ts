import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

export interface Song {
  url: string;
  title: string;
  id: string;
  seqId?: number;
}

export interface MusicPlayerState {
  playlist: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  isWindowOpen: boolean;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  showVideo: boolean;
  duration: number;
  playedSeconds: number;
  seeking: boolean;
  isMuted: boolean;
  currentSong: Song | null;
}

// Default songs to include in the playlist
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

  const playlist = stored?.playlist ?? defaultSongs;
  const currentSongIndex = stored?.currentSongIndex ?? 0;

  return {
    playlist,
    currentSongIndex: currentSongIndex < playlist.length ? currentSongIndex : 0,
    isPlaying: stored?.isPlaying ?? false,
    isWindowOpen: stored?.isWindowOpen ?? false,
    currentTime: stored?.currentTime ?? 0,
    volume: stored?.volume ?? 0.7,
    isLoading: false,
    showVideo: false,
    duration: 0,
    playedSeconds: 0,
    seeking: false,
    isMuted: false,
    currentSong: playlist.length > 0 ? playlist[currentSongIndex] : null,
  };
};

// Main state atom for the music player
export const musicPlayerAtom = atom<MusicPlayerState>(getInitialState());

// Action to persist state changes
export const persistMusicPlayerState = atom(
  (get) => get(musicPlayerAtom),
  (get, set, update: Partial<MusicPlayerState>) => {
    const currentState = get(musicPlayerAtom);
    const newState = { ...currentState, ...update };

    set(musicPlayerAtom, newState);

    // Only persist essential state to localStorage
    saveFeatureState("musicPlayer", {
      playlist: newState.playlist,
      currentSongIndex: newState.currentSongIndex,
      isPlaying: newState.isPlaying,
      isWindowOpen: newState.isWindowOpen,
      currentTime: newState.currentTime,
      volume: newState.volume,
    });
  }
);

// Helper to extract YouTube video ID from URL
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Actions for player control
export const playPauseAtom = atom(null, (get, set) => {
  const state = get(musicPlayerAtom);
  const newPlayingState = !state.isPlaying;

  set(persistMusicPlayerState, {
    isPlaying: newPlayingState,
  });
});

export const nextSongAtom = atom(null, (get, set) => {
  const state = get(musicPlayerAtom);
  if (state.playlist.length <= 1) return;

  const nextIndex = (state.currentSongIndex + 1) % state.playlist.length;

  set(persistMusicPlayerState, {
    currentSongIndex: nextIndex,
    currentTime: 0,
    isPlaying: true,
    currentSong: state.playlist[nextIndex],
  });
});

export const prevSongAtom = atom(null, (get, set) => {
  const state = get(musicPlayerAtom);
  if (state.playlist.length <= 1) return;

  const prevIndex =
    (state.currentSongIndex - 1 + state.playlist.length) %
    state.playlist.length;

  set(persistMusicPlayerState, {
    currentSongIndex: prevIndex,
    currentTime: 0,
    isPlaying: true,
    currentSong: state.playlist[prevIndex],
  });
});

export const setVolumeAtom = atom(null, (get, set, volume: number) => {
  set(persistMusicPlayerState, {
    volume,
    isMuted: volume === 0,
  });
});

export const toggleMuteAtom = atom(null, (get, set) => {
  const state = get(musicPlayerAtom);
  const isMuted = !state.isMuted;

  set(persistMusicPlayerState, {
    isMuted,
    volume: isMuted ? 0 : state.volume || 0.7,
  });
});

export const addSongAtom = atom(null, (get, set, song: Song) => {
  const state = get(musicPlayerAtom);
  const newPlaylist = [...state.playlist, song];

  set(persistMusicPlayerState, {
    playlist: newPlaylist,
    currentSongIndex: newPlaylist.length === 1 ? 0 : state.currentSongIndex,
    currentSong: newPlaylist.length === 1 ? song : state.currentSong,
  });
});

export const removeSongAtom = atom(null, (get, set, index: number) => {
  const state = get(musicPlayerAtom);
  if (index < 0 || index >= state.playlist.length) return;

  const newPlaylist = state.playlist.filter((_, i) => i !== index);
  let newIndex = state.currentSongIndex;

  // Adjust current index after removal
  if (newPlaylist.length === 0) {
    newIndex = 0;
  } else if (index === state.currentSongIndex) {
    newIndex = Math.min(index, newPlaylist.length - 1);
  } else if (index < state.currentSongIndex) {
    newIndex = state.currentSongIndex - 1;
  }

  set(persistMusicPlayerState, {
    playlist: newPlaylist,
    currentSongIndex: newIndex,
    isPlaying: newPlaylist.length > 0 ? state.isPlaying : false,
    currentSong: newPlaylist.length > 0 ? newPlaylist[newIndex] : null,
  });
});

export const setSeekPositionAtom = atom(null, (get, set, time: number) => {
  set(persistMusicPlayerState, {
    currentTime: time,
    playedSeconds: time,
  });
});

export const toggleVideoAtom = atom(null, (get, set) => {
  const state = get(musicPlayerAtom);
  set(persistMusicPlayerState, {
    showVideo: !state.showVideo,
  });
});

export const updateSongTitleAtom = atom(
  null,
  (get, set, params: { index: number; title: string }) => {
    const { index, title } = params;
    const state = get(musicPlayerAtom);

    if (index < 0 || index >= state.playlist.length) return;

    const newPlaylist = [...state.playlist];
    newPlaylist[index] = {
      ...newPlaylist[index],
      title: title.trim() || `Song ${index + 1}`,
    };

    set(persistMusicPlayerState, {
      playlist: newPlaylist,
      currentSong:
        index === state.currentSongIndex
          ? newPlaylist[index]
          : state.currentSong,
    });
  }
);
