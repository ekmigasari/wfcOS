import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "../../infrastructure/utils/storage";

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

// Type for player state
export interface AmbiencePlayerState {
  currentSoundIndex: number;
  isPlaying: boolean;
  volume: number;
}

// Get stored state or use defaults
const getInitialState = (): AmbiencePlayerState => {
  const stored = loadFeatureState<AmbiencePlayerState>("ambiencePlayer");

  return {
    currentSoundIndex: stored?.currentSoundIndex ?? 0,
    isPlaying: stored?.isPlaying ?? false,
    volume: stored?.volume ?? 0.7,
  };
};

// Primary state atoms
export const currentSoundIndexAtom = atom<number>(
  getInitialState().currentSoundIndex
);
export const isPlayingAtom = atom<boolean>(getInitialState().isPlaying);
export const volumeAtom = atom<number>(getInitialState().volume);

// Derived atom to get the current sound
export const currentSoundAtom = atom((get) => {
  const currentIndex = get(currentSoundIndexAtom);
  return ambienceSounds[currentIndex];
});

// Player control actions
export const ambiencePlayerActions = atom(
  null,
  (
    get,
    set,
    action: {
      type:
        | "play"
        | "pause"
        | "toggle"
        | "next"
        | "previous"
        | "setVolume"
        | "setSoundIndex";
      payload?: number;
    }
  ) => {
    const currentIndex = get(currentSoundIndexAtom);
    const soundsCount = ambienceSounds.length;

    switch (action.type) {
      case "play":
        set(isPlayingAtom, true);
        break;
      case "pause":
        set(isPlayingAtom, false);
        break;
      case "toggle":
        set(isPlayingAtom, !get(isPlayingAtom));
        break;
      case "next":
        set(currentSoundIndexAtom, (currentIndex + 1) % soundsCount);
        break;
      case "previous":
        set(
          currentSoundIndexAtom,
          (currentIndex - 1 + soundsCount) % soundsCount
        );
        break;
      case "setVolume":
        if (action.payload !== undefined) {
          set(volumeAtom, action.payload);
        }
        break;
      case "setSoundIndex":
        if (action.payload !== undefined) {
          set(
            currentSoundIndexAtom,
            Math.max(0, Math.min(action.payload, soundsCount - 1))
          );
        }
        break;
    }

    // Save to storage
    saveFeatureState("ambiencePlayer", {
      currentSoundIndex: get(currentSoundIndexAtom),
      isPlaying: get(isPlayingAtom),
      volume: get(volumeAtom),
    });
  }
);
