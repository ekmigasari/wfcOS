import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "../infrastructure/utils/storage";

// Define the interface for an ambience sound
export interface AmbienceSound {
  id: string;
  title: string;
  source: string;
}

// Create a list of ambience sounds
export const ambienceSounds: AmbienceSound[] = [
  {
    id: "rain",
    title: "Gentle Rain",
    source: "/sounds/ambience/rain.mp3",
  },
  {
    id: "forest",
    title: "Forest Sounds",
    source: "/sounds/ambience/forest.mp3",
  },
  {
    id: "river",
    title: "Flowing River",
    source: "/sounds/ambience/river.mp3",
  },
  {
    id: "ocean",
    title: "Ocean Waves",
    source: "/sounds/ambience/ocean.mp3",
  },
  {
    id: "thunder",
    title: "Thunderstorm",
    source: "/sounds/ambience/thunder.mp3",
  },
  {
    id: "night",
    title: "Calm Night",
    source: "/sounds/ambience/night.mp3",
  },
  {
    id: "fireplace",
    title: "Fireplace",
    source: "/sounds/ambience/fireplace.mp3",
  },
  {
    id: "cafe",
    title: "Coffee Shop",
    source: "/sounds/ambience/cafe.mp3",
  },
  {
    id: "park",
    title: "Park Ambience",
    source: "/sounds/ambience/park.mp3",
  },
  {
    id: "coffee",
    title: "Making a coffee",
    source: "/sounds/ambience/making-a-coffee-latte.mp3",
  },
];

// Get stored state or use defaults
const getInitialState = () => {
  const stored = loadFeatureState<{
    currentSoundIndex: number;
    isPlaying: boolean;
    volume: number;
    isWindowOpen: boolean;
    currentTime: number;
  }>("ambiencePlayer");

  return {
    currentSoundIndex: stored?.currentSoundIndex ?? 0,
    isPlaying: stored?.isPlaying ?? false,
    volume: stored?.volume ?? 0.7,
    isWindowOpen: stored?.isWindowOpen ?? false,
    currentTime: stored?.currentTime ?? 0,
  };
};

// Create atoms
export const currentSoundIndexAtom = atom<number>(
  getInitialState().currentSoundIndex
);
export const isPlayingAtom = atom<boolean>(getInitialState().isPlaying);
export const volumeAtom = atom<number>(getInitialState().volume);
export const isWindowOpenAtom = atom<boolean>(getInitialState().isWindowOpen);
export const currentTimeAtom = atom<number>(getInitialState().currentTime);

// Derived atom to get the current sound
export const currentSoundAtom = atom((get) => {
  const currentIndex = get(currentSoundIndexAtom);
  return ambienceSounds[currentIndex];
});

// Persist state when it changes
export const persistAmbiencePlayerState = atom(
  (get) => ({
    currentSoundIndex: get(currentSoundIndexAtom),
    isPlaying: get(isPlayingAtom),
    volume: get(volumeAtom),
    isWindowOpen: get(isWindowOpenAtom),
    currentTime: get(currentTimeAtom),
  }),
  (
    _get,
    set,
    newState: {
      currentSoundIndex?: number;
      isPlaying?: boolean;
      volume?: number;
      isWindowOpen?: boolean;
      currentTime?: number;
    }
  ) => {
    if (newState.currentSoundIndex !== undefined) {
      set(currentSoundIndexAtom, newState.currentSoundIndex);
    }
    if (newState.isPlaying !== undefined) {
      set(isPlayingAtom, newState.isPlaying);
    }
    if (newState.volume !== undefined) {
      set(volumeAtom, newState.volume);
    }
    if (newState.isWindowOpen !== undefined) {
      set(isWindowOpenAtom, newState.isWindowOpen);
    }
    if (newState.currentTime !== undefined) {
      set(currentTimeAtom, newState.currentTime);
    }

    // Save to local storage
    const currentState = {
      currentSoundIndex:
        newState.currentSoundIndex !== undefined
          ? newState.currentSoundIndex
          : _get(currentSoundIndexAtom),
      isPlaying:
        newState.isPlaying !== undefined
          ? newState.isPlaying
          : _get(isPlayingAtom),
      volume:
        newState.volume !== undefined ? newState.volume : _get(volumeAtom),
      isWindowOpen:
        newState.isWindowOpen !== undefined
          ? newState.isWindowOpen
          : _get(isWindowOpenAtom),
      currentTime:
        newState.currentTime !== undefined
          ? newState.currentTime
          : _get(currentTimeAtom),
    };

    saveFeatureState("ambiencePlayer", currentState);
  }
);
