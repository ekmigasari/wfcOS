import { atom } from "jotai";

import { Position, Size } from "@/application/types/window"; // Assuming types are defined here

import {
  loadFeatureState,
  saveFeatureState,
} from "../../infrastructure/utils/storage";

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
export type WindowRegistryState = Record<string, WindowState>;

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
        ? newRegistry(get(baseWindowsAtom)) // Pass current state to the update function
        : newRegistry;

    // Filter out any potentially undefined entries before saving
    const validRegistry = Object.entries(updatedRegistry)
      .filter(([, value]) => value !== undefined)
      .reduce<WindowRegistryState>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    set(baseWindowsAtom, validRegistry);
    saveFeatureState(FEATURE_KEY, validRegistry);
  }
);

// Atom to get an array of currently open windows, sorted by zIndex
export const openWindowsAtom = atom(
  (get) =>
    Object.values(get(windowRegistryAtom))
      .filter((win) => win.isOpen) // Add null check for win
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)) // Add null checks
);

// Atom to get minimized windows for the taskbar
export const minimizedWindowsAtom = atom(
  (get) =>
    Object.values(get(windowRegistryAtom))
      .filter((win) => win.isMinimized) // Add null check
      .sort((a, b) => (a.appId ?? "").localeCompare(b.appId ?? "")) // Add null checks
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
      (win) => win.id === windowConfig.id // Use the specific instance ID
    );

    let windowIdToUpdate: string;
    let newZIndex: number;

    if (existingWindow) {
      // If window exists, bring it to front and ensure it's open and not minimized
      windowIdToUpdate = existingWindow.id;
      newZIndex = getNextZIndex(currentRegistry);
      set(windowRegistryAtom, (prev) => ({
        ...prev,
        [windowIdToUpdate]: {
          ...existingWindow,
          isOpen: true,
          isMinimized: false,
          zIndex: newZIndex,
        },
      }));
    } else {
      // If window doesn't exist, create it
      windowIdToUpdate = windowConfig.id; // Use the provided ID
      newZIndex = getNextZIndex(currentRegistry);
      // Basic centering logic if no position provided
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
        zIndex: newZIndex,
      };
      set(windowRegistryAtom, (prev) => ({
        ...prev,
        [windowIdToUpdate]: newWindow,
      }));
    }

    // Bring the window to front (redundant if new, necessary if existing)
    // We already set the zIndex above.
  }
);

// Atom to close a window
export const closeWindowAtom = atom(null, (get, set, windowId: string) => {
  const currentRegistry = get(windowRegistryAtom);
  const windowToClose = currentRegistry[windowId];

  if (!windowToClose) {
    console.warn(`Window with ID ${windowId} not found for closing.`);
    return; // Window doesn't exist
  }

  // Update the state to mark the window as closed
  set(windowRegistryAtom, (prev) => {
    const newState = { ...prev };
    if (newState[windowId]) {
      newState[windowId] = { ...newState[windowId], isOpen: false };
    }
    return newState;
  });
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

      // Only proceed if window exists
      if (!windowState) {
        console.warn(
          `Window with ID ${windowId} not found for minimizing/restoring.`
        );
        return prev; // Return prev inside the set callback
      }

      // Prevent redundant updates if already in the target state
      if (windowState.isMinimized === isMinimized) {
        return prev; // Return prev inside the set callback
      }

      // Update the window state
      const updatedWindowState: WindowState = {
        ...windowState,
        isMinimized: isMinimized,
        // Don't change zIndex when minimizing/restoring here,
        // focusWindow handles bringing to front on restore.
      };

      // Return the updated registry state
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
    if (!windowToFocus || !windowToFocus.isOpen || windowToFocus.isMinimized) {
      return prev; // Don't focus closed or minimized windows
    }

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
    });
  }
);

// Atom to maximize a window (placeholder for future)
// export const maximizeWindowAtom = atom(...)
