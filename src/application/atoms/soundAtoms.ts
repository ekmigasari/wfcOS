import { atomWithStorage } from "jotai/utils";

// Persist sound mute preference in local storage
export const isSoundMutedAtom = atomWithStorage("isSoundMuted", false);
