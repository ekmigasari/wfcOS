import { atomWithStorage } from "jotai/utils";

// Sound volume levels - including 'mute'
export type SoundVolumeLevel = "mute" | "low" | "medium" | "full";

// Persist sound volume preference in local storage
export const soundVolumeLevelAtom = atomWithStorage<SoundVolumeLevel>(
  "soundVolumeLevel",
  "medium" // Default remains medium
);

// Volume percentage mappings
export const volumeLevelPercentages: Record<SoundVolumeLevel, number> = {
  mute: 0, // Mute corresponds to 0%
  low: 35,
  medium: 70,
  full: 100,
};
