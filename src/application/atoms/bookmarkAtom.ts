import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "../../infrastructure/utils/storage";
import { v4 as uuidv4 } from "uuid";

const FEATURE_KEY = "bookmarks";

// Define bookmark item type
export type BookmarkItem = {
  id: string;
  name: string;
  url: string;
};

// Define the shape of the state
export type BookmarkState = BookmarkItem[];

// Load initial state from localStorage or use default (empty array)
const initialBookmarks = loadFeatureState<BookmarkState>(FEATURE_KEY) ?? [
  {
    id: "default-feedback-bookmark",
    name: "Give Feedback for WFC OS",
    url: "https://workfromcoffee.featurebase.app/",
  },
];

// Create the base atom
const baseBookmarksAtom = atom<BookmarkState>(initialBookmarks);

// Create a derived atom that saves to localStorage on change
export const bookmarksAtom = atom(
  (get) => get(baseBookmarksAtom),
  (
    get,
    set,
    newBookmarks:
      | BookmarkState
      | ((prevBookmarks: BookmarkState) => BookmarkState)
  ) => {
    const updatedBookmarks =
      typeof newBookmarks === "function"
        ? newBookmarks(get(baseBookmarksAtom))
        : newBookmarks;
    set(baseBookmarksAtom, updatedBookmarks);
    saveFeatureState(FEATURE_KEY, updatedBookmarks);
  }
);

// Action atoms for CRUD operations
export const addBookmarkAtom = atom(
  null,
  (get, set, { name, url }: { name: string; url: string }) => {
    // Add proper URL scheme if missing
    const formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    set(bookmarksAtom, (prev) => [
      { id: uuidv4(), name, url: formattedUrl },
      ...prev,
    ]);
  }
);

export const updateBookmarkAtom = atom(
  null,
  (get, set, { id, name, url }: { id: string; name: string; url: string }) => {
    // Add proper URL scheme if missing
    const formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    set(bookmarksAtom, (prev) =>
      prev.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, name, url: formattedUrl } : bookmark
      )
    );
  }
);

export const deleteBookmarkAtom = atom(null, (get, set, id: string) => {
  set(bookmarksAtom, (prev) => prev.filter((bookmark) => bookmark.id !== id));
});

export const reorderBookmarksAtom = atom(
  null,
  (
    get,
    set,
    { oldIndex, newIndex }: { oldIndex: number; newIndex: number }
  ) => {
    set(bookmarksAtom, (prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }
);
