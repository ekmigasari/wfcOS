import { atom } from "jotai";
import type {
  Decoration,
  GalleryEntry,
  PhotoboxSettings,
} from "@/app/(photobooth)/types/photobox";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

// Storage keys
export const PHOTOBOX_SETTINGS_KEY = "photobox_settings";
export const PHOTOBOX_GALLERY_KEY = "photobox_gallery";

const DEFAULT_SETTINGS: PhotoboxSettings = {
  layoutId: "strip-3",
  filterId: "normal",
  effectId: "none",
  frameId: "cream",
  countdown: 3,
  mirror: true,
  caption: {
    text: "Work From Coffee",
    font: "sans",
    color: null,
    showDate: true,
  },
};

const loadSettings = (): PhotoboxSettings => {
  const saved = loadFeatureState<Partial<PhotoboxSettings>>(
    PHOTOBOX_SETTINGS_KEY
  );
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    caption: { ...DEFAULT_SETTINGS.caption, ...saved?.caption },
  };
};

// --- Persisted atoms (localStorage) ---

const baseSettingsAtom = atom<PhotoboxSettings>(loadSettings());
export const photoboxSettingsAtom = atom(
  (get) => get(baseSettingsAtom),
  (get, set, update: Partial<PhotoboxSettings>) => {
    const next = { ...get(baseSettingsAtom), ...update };
    set(baseSettingsAtom, next);
    saveFeatureState(PHOTOBOX_SETTINGS_KEY, next);
  }
);

// Metadata only; the JPEG blobs live in IndexedDB (see photoboxStorage)
const baseGalleryAtom = atom<GalleryEntry[]>(
  loadFeatureState<GalleryEntry[]>(PHOTOBOX_GALLERY_KEY) ?? []
);
export const photoboxGalleryAtom = atom(
  (get) => get(baseGalleryAtom),
  (
    get,
    set,
    update: GalleryEntry[] | ((prev: GalleryEntry[]) => GalleryEntry[])
  ) => {
    const next =
      typeof update === "function" ? update(get(baseGalleryAtom)) : update;
    set(baseGalleryAtom, next);
    saveFeatureState(PHOTOBOX_GALLERY_KEY, next);
  }
);

// --- Session atoms (in memory, cleared on reload) ---

// Captured photos as JPEG data URLs, indexed by layout slot
export const photoboxPhotosAtom = atom<(string | null)[]>([]);
export const photoboxDecorationsAtom = atom<Decoration[]>([]);
