import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "../../infrastructure/utils/storage";
import { Position, Size } from "@/application/types/window"; // Assuming types are defined here

const FEATURE_KEY = "windows";

// Define the shape of a single window's state
export interface WindowState {
  id: string; // Unique ID for each window instance
  appId: string; // Identifier for the type of app (e.g., 'podomoro', 'todoList')
  title: string;
  position: Position;
  size: Size;
  minSize?: Size;
  isOpen: boolean; // To track if the window should be rendered
  isMinimized: boolean; // Track if window is minimized to taskbar
  zIndex: number; // To manage stacking order
}

// Define the shape of the overall window management state
export type WindowRegistryState = {
  [id: string]: WindowState; // Store windows in an object for easier access by ID
};

// Helper function to get the next highest zIndex
function getNextZIndex(registry: WindowRegistryState): number {
  const windows = Object.values(registry);
  if (windows.length === 0) return 100; // Start at 100 for the first window
  // Find the highest current zIndex
  const maxZIndex = windows.reduce((max, win) => Math.max(max, win.zIndex), 0);
  return maxZIndex + 1; // Make the new one 1 higher
}

// Initialize from localStorage if available, or with defaults
function getInitialState(): WindowRegistryState {
  // Try to load saved state
  const savedState = loadFeatureState<WindowRegistryState>(FEATURE_KEY);
  if (savedState && typeof savedState === "object") {
    // Validate or transform the saved state if needed
    return savedState;
  }
  // Default to an empty registry
  return {};
}

// Create the base atom with proper initialization to handle hydration
const baseWindowsAtom = atom<WindowRegistryState>(getInitialState());

// Create a derived atom that saves to localStorage on change
export const windowRegistryAtom = atom(
  (get) => get(baseWindowsAtom),
  (
    get,
    set,
    newRegistry:
      | WindowRegistryState
      | ((prevRegistry: WindowRegistryState) => WindowRegistryState)
  ) => {
    const updatedRegistry =
      typeof newRegistry === "function"
        ? newRegistry(get(baseWindowsAtom))
        : newRegistry;
    set(baseWindowsAtom, updatedRegistry);
    saveFeatureState(FEATURE_KEY, updatedRegistry);
  }
);

// Atom to get an array of currently open windows, sorted by zIndex
export const openWindowsAtom = atom(
  (get) =>
    Object.values(get(windowRegistryAtom))
      .filter((win) => win.isOpen) // Include all open windows, even if minimized
      .sort((a, b) => a.zIndex - b.zIndex) // Render lower zIndex first (behind)
);

// Atom to get minimized windows for the taskbar
export const minimizedWindowsAtom = atom(
  (get) =>
    Object.values(get(windowRegistryAtom))
      .filter((win) => win.isOpen && win.isMinimized)
      .sort((a, b) => a.appId.localeCompare(b.appId)) // Sort by app ID for consistent order
);

// --- Window Management Action Atoms (Write-only) ---

// Atom to open/create a new window or bring an existing one to front
export const openWindowAtom = atom(
  null,
  (
    get,
    set,
    windowConfig: Omit<
      WindowState,
      "isOpen" | "zIndex" | "position" | "size" | "isMinimized"
    > & { initialPosition?: Position; initialSize: Size }
  ) => {
    const currentRegistry = get(windowRegistryAtom);
    const existingWindow = Object.values(currentRegistry).find(
      (win) => win.appId === windowConfig.appId && win.id === windowConfig.id
    ); // Find by specific ID if provided, or just appId? Let's require ID for now.

    // const windowIdToFocus = windowConfig.id;

    if (existingWindow) {
      // If window exists, bring it to front and ensure it's open
      set(windowRegistryAtom, (prev) => ({
        ...prev,
        [existingWindow.id]: {
          ...existingWindow,
          isOpen: true,
          isMinimized: false, // Unminimize if it was
          zIndex: getNextZIndex(prev),
        },
      }));
    } else {
      // If window doesn't exist, create it
      const nextZIndex = getNextZIndex(currentRegistry);
      // Basic centering logic if no position provided - should be improved later
      const defaultPosition = windowConfig.initialPosition ?? {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
      };
      const newWindow: WindowState = {
        ...windowConfig,
        position: defaultPosition,
        size: windowConfig.initialSize,
        isOpen: true,
        isMinimized: false,
        zIndex: nextZIndex,
      };
      set(windowRegistryAtom, (prev) => ({
        ...prev,
        [newWindow.id]: newWindow,
      }));
      // windowIdToFocus = newWindow.id;
    }
    // This atom doesn't directly return the focused ID, the caller manages that
  }
);

// Atom to close a window
export const closeWindowAtom = atom(null, (get, set, windowId: string) => {
  set(windowRegistryAtom, (prev) => {
    const newState = { ...prev };
    if (newState[windowId]) {
      // Option 1: Mark as closed (keeps state like position/size)
      newState[windowId] = { ...newState[windowId], isOpen: false };
      // Option 2: Remove completely (loses state unless saved elsewhere)
      // delete newState[windowId];
    }
    return newState;
  });
  // Note: We keep the window state (pos/size) even when closed
  // This allows reopening it in the same place later via openWindowAtom
});

// Atom to explicitly set the minimized state of a window
export const setWindowMinimizedStateAtom = atom(
  null,
  (
    get,
    set,
    { windowId, isMinimized }: { windowId: string; isMinimized: boolean }
  ) => {
    set(windowRegistryAtom, (prev) => {
      const windowState = prev[windowId];
      // Only proceed if window exists and is open
      if (!windowState || !windowState.isOpen) return prev;

      // Prevent redundant updates if already in the target state
      if (windowState.isMinimized === isMinimized) return prev;

      // Create the updated window state with only the isMinimized change
      const updatedWindowState = {
        ...windowState,
        isMinimized: isMinimized,
        // No zIndex changes - WindowBase will only show/hide based on isMinimized
      };

      return {
        ...prev,
        [windowId]: updatedWindowState,
      };
    });
  }
);

// Atom to bring a window to the front
export const focusWindowAtom = atom(null, (get, set, windowId: string) => {
  set(windowRegistryAtom, (prev) => {
    const windowToFocus = prev[windowId];
    if (!windowToFocus || !windowToFocus.isOpen || windowToFocus.isMinimized)
      return prev; // Don't focus closed/minimized/non-existent windows

    const maxZIndex = getNextZIndex(prev) - 1; // Get current max zIndex

    // Only update if it's not already the top window
    if (windowToFocus.zIndex < maxZIndex) {
      return {
        ...prev,
        [windowId]: { ...windowToFocus, zIndex: maxZIndex + 1 }, // Assign new highest zIndex
      };
    }
    return prev; // No change needed
  });
});

// Atom to update a window's position and size (e.g., after drag/resize)
export const updateWindowPositionSizeAtom = atom(
  null,
  (
    get,
    set,
    { id, position, size }: { id: string; position: Position; size: Size }
  ) => {
    set(windowRegistryAtom, (prev) => {
      const windowToUpdate = prev[id];
      if (!windowToUpdate) return prev;
      return {
        ...prev,
        [id]: { ...windowToUpdate, position, size },
      };
      // Note: Doesn't automatically bring to front, focusWindowAtom handles that
    });
  }
);

// Atom to maximize a window (placeholder for future)
// export const maximizeWindowAtom = atom(...)
