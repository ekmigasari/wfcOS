import { atom, WritableAtom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

const FEATURE_KEY = "timer";
const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes
const DEFAULT_SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK_TIME = 15 * 60; // 15 minutes
const DEFAULT_CUSTOM_MINUTES = 10; // Default custom time

export type TimerSetting = "work25" | "short5" | "long15" | "custom";

// Define the shape of the Timer state
export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  timerSetting: TimerSetting;
  customDurationMinutes: number;
  customTitle: string;
  windowId: string | null;
  isMinimized: boolean;
  isActive: boolean;
}

// Helper function to get the correct duration in seconds based on the current setting
const getDurationForSetting = (
  setting: TimerSetting,
  customMinutes: number
): number => {
  const safeCustomMinutes =
    customMinutes > 0 ? customMinutes : DEFAULT_CUSTOM_MINUTES;
  const customSeconds = safeCustomMinutes * 60;

  switch (setting) {
    case "work25":
      return DEFAULT_WORK_TIME;
    case "short5":
      return DEFAULT_SHORT_BREAK_TIME;
    case "long15":
      return DEFAULT_LONG_BREAK_TIME;
    case "custom":
      return customSeconds;
    default:
      return DEFAULT_WORK_TIME;
  }
};

// Define the initial state (load from storage or use defaults)
const initialTimerState: TimerState = (() => {
  const savedState = loadFeatureState<TimerState>(FEATURE_KEY);

  // Define default values
  const defaults: TimerState = {
    timeRemaining: DEFAULT_WORK_TIME,
    isRunning: false,
    timerSetting: "work25",
    customDurationMinutes: DEFAULT_CUSTOM_MINUTES,
    customTitle: "Custom Timer",
    windowId: null,
    isMinimized: false,
    isActive: false, // Ensure timer starts inactive
  };

  // Merge saved state with defaults, ensuring new fields have defaults
  const mergedState = {
    ...defaults,
    ...savedState,
    isRunning: false, // Crucial: ensure timer isn't running on load regardless of saved state
    isActive: false, // Ensure timer is inactive on load
    windowId: null, // Ensure no window association on load
  };

  // Set initial timeRemaining based on merged settings
  const initialTime = getDurationForSetting(
    mergedState.timerSetting,
    mergedState.customDurationMinutes
  );

  // Correct initial state should not have an active window ID or be active
  return {
    ...mergedState,
    timeRemaining: initialTime,
  };
})();

// Create the base atom
const baseTimerAtom = atom<TimerState>(initialTimerState);

// Create a derived atom that saves to localStorage on change
export const timerAtom = atom(
  (get) => get(baseTimerAtom),
  (
    get,
    set,
    newState: TimerState | ((prevState: TimerState) => TimerState)
  ) => {
    const currentState = get(baseTimerAtom);
    const updatedState =
      typeof newState === "function"
        ? newState(currentState) // Pass current state to the update function
        : newState;

    // Only update base atom and save if the state has actually changed
    // Add null check for stringify
    if (
      JSON.stringify(currentState ?? {}) !== JSON.stringify(updatedState ?? {})
    ) {
      set(baseTimerAtom, updatedState);
      saveFeatureState(FEATURE_KEY, updatedState);
    }
  }
);

// --- Action Helpers / Derived Atoms ---

// Toggle timer start/pause
export const startPauseTimerAtom = atom(
  null, // write-only atom
  (get, set) => {
    set(timerAtom, (prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  }
);

// Reset timer to full duration based on current settings
export const resetTimerAtom = atom(null, (get, set) => {
  set(timerAtom, (prev) => {
    const newTimeRemaining = getDurationForSetting(
      prev.timerSetting,
      prev.customDurationMinutes
    );

    // Notify worker about reset if it exists in the window context
    if (typeof window !== "undefined") {
      // Use setTimeout to ensure this runs after state update
      setTimeout(() => {
        // Dispatch a custom event that GlobalTimerManager can listen for
        window.dispatchEvent(new CustomEvent("timer-reset"));
      }, 0);
    }

    return {
      ...prev,
      timeRemaining: newTimeRemaining,
      isRunning: false, // Stop timer on reset
    };
  });
});

// Set timer setting and update duration
export const setTimerSettingAtom = atom(
  null,
  (get, set, newSetting: TimerSetting) => {
    set(timerAtom, (prev) => {
      const newTimeRemaining = getDurationForSetting(
        newSetting,
        prev.customDurationMinutes
      );
      return {
        ...prev,
        timerSetting: newSetting,
        timeRemaining: newTimeRemaining,
        isRunning: false, // Stop timer on setting change
      };
    });
  }
);

// Set custom duration (in minutes)
export const setCustomDurationAtom = atom(
  null,
  (get, set, newMinutes: number) => {
    // Ensure the input is a valid number, default to DEFAULT_CUSTOM_MINUTES if not
    const parsedMinutes = Number(newMinutes);
    const validatedMinutes =
      Number.isNaN(parsedMinutes) || parsedMinutes <= 0
        ? DEFAULT_CUSTOM_MINUTES
        : parsedMinutes;

    set(timerAtom, (prev) => {
      let newTimeRemaining = prev.timeRemaining;
      let shouldStopTimer = false;

      // If currently using the 'custom' setting, update timer immediately and stop it
      if (prev.timerSetting === "custom") {
        newTimeRemaining = getDurationForSetting(
          "custom",
          validatedMinutes // Use the new minutes
        );
        shouldStopTimer = true; // Stop timer when custom time is changed while active
      }
      return {
        ...prev,
        customDurationMinutes: validatedMinutes,
        // Only reset time if custom is the active setting
        timeRemaining:
          prev.timerSetting === "custom"
            ? newTimeRemaining
            : prev.timeRemaining,
        // Stop the timer if we changed the time while the custom setting was active
        isRunning: shouldStopTimer ? false : prev.isRunning,
      };
    });
  }
);

// Set custom title
export const setCustomTitleAtom = atom(null, (get, set, newTitle: string) => {
  set(timerAtom, (prev) => ({
    ...prev,
    customTitle: newTitle || "Custom Timer",
  }));
});

// --- Window Lifecycle Callbacks ---

// Type definition for the Jotai set function, simplified for this context
type JotaiSet = <Value, Result>(
  atom: WritableAtom<Value, [Value | ((prev: Value) => Value)], Result>,
  update: Value | ((prev: Value) => Value)
) => Result;

/**
 * Callback executed when a Timer window is opened.
 * Associates the windowId with the timer state.
 */
export const handleTimerOpen = (set: JotaiSet, windowId: string) => {
  set(timerAtom, (prev) => {
    // Check if a timer window is already active to prevent conflicts (optional)
    if (prev.isActive && prev.windowId && prev.windowId !== windowId) {
      console.warn(
        `Timer is already active in window ${prev.windowId}. Cannot open another.`
      );
      return prev; // Or handle differently, e.g., allow multiple timers
    }
    return {
      ...prev,
      windowId: windowId,
      isActive: true,
      isMinimized: false, // Ensure it's not minimized on open
    };
  });
};

/**
 * Callback executed when a Timer window is closed.
 * Resets the timer, stops it, and disassociates the windowId.
 */
export const handleTimerClose = (set: JotaiSet, windowId: string) => {
  set(timerAtom, (prev) => {
    // Only act if the closing window is the currently active timer window
    if (prev.windowId !== windowId) {
      return prev;
    }

    const newTimeRemaining = getDurationForSetting(
      prev.timerSetting,
      prev.customDurationMinutes
    );

    // Dispatch reset event to ensure the worker stops/resets
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("timer-reset"));
    }

    return {
      ...prev,
      timeRemaining: newTimeRemaining,
      isRunning: false,
      windowId: null,
      isMinimized: false,
      isActive: false, // Mark timer as inactive
    };
  });
};

/**
 * Callback executed when a Timer window is minimized or restored.
 * Updates the isMinimized state.
 */
export const handleTimerMinimize = (
  set: JotaiSet,
  windowId: string,
  isMinimized: boolean
) => {
  set(timerAtom, (prev) => {
    // Only update if the window ID matches the active timer
    if (prev.windowId !== windowId) {
      return prev;
    }
    // Avoid redundant updates
    if (prev.isMinimized === isMinimized) {
      return prev;
    }
    return {
      ...prev,
      isMinimized: isMinimized,
    };
  });
};
