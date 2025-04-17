import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

// Default background path
const DEFAULT_BACKGROUND = "/background/bg-2.png";
const DEFAULT_FIT = "fill";
const DEFAULT_SETTINGS: BackgroundSettings = {
  url: DEFAULT_BACKGROUND,
  fit: DEFAULT_FIT,
};

export type BackgroundFit = "fill" | "fit" | "stretch" | "tile" | "center";

export interface BackgroundSettings {
  url: string | null;
  fit: BackgroundFit;
}

// Create a storage utility that uses localStorage and handles JSON parsing/stringifying
// Also handles cases where localStorage is not available (SSR)
const storage = createJSONStorage<BackgroundSettings>(() => {
  if (typeof window !== "undefined") {
    return localStorage;
  }
  // Return a dummy storage object for SSR
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem: (_key) => null, // Always return null on server
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setItem: (_key, _value) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItem: (_key) => {},
  };
});

// Atom synced with localStorage using atomWithStorage
// It handles SSR hydration automatically by returning the defaultValue on the server
// and the localStorage value on the client after hydration.
export const backgroundSettingsAtom = atomWithStorage<BackgroundSettings>(
  "backgroundSettings", // Key in localStorage
  DEFAULT_SETTINGS, // Default value (used on server and initial client render)
  storage // The storage utility we created
);
backgroundSettingsAtom.debugLabel = "backgroundSettingsAtom (synced)";

// Preview atom for temporary display of background changes before applying
export const previewBackgroundAtom = atom<BackgroundSettings | null>(null);
previewBackgroundAtom.debugLabel = "previewBackgroundAtom";

// Atom to save the preview (if any) back to the main synced atom
export const applyPreviewBackgroundAtom = atom(
  null, // Write-only atom
  (get, set) => {
    const preview = get(previewBackgroundAtom);
    if (preview !== null) {
      set(backgroundSettingsAtom, preview); // Save preview to the synced atom
      set(previewBackgroundAtom, null); // Clear preview
    }
  }
);
applyPreviewBackgroundAtom.debugLabel = "applyPreviewBackgroundAtom";

// Combined atom that returns either the preview (if set) or the saved background
// Reads from the new backgroundSettingsAtom
export const activeBackgroundAtom = atom((get) => {
  const preview = get(previewBackgroundAtom);
  if (preview !== null) {
    return preview;
  }
  // Read from the atomWithStorage instance
  return get(backgroundSettingsAtom);
});
activeBackgroundAtom.debugLabel = "activeBackgroundAtom";
