import { atom } from "jotai";
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
    isActive: false,
  };

  // Merge saved state with defaults, ensuring new fields have defaults
  const mergedState = {
    ...defaults,
    ...savedState,
    isRunning: false, // Crucial: ensure timer isn't running on load regardless of saved state
  };

  // Set initial timeRemaining based on merged settings
  const initialTime = getDurationForSetting(
    mergedState.timerSetting,
    mergedState.customDurationMinutes
  );

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
    if (JSON.stringify(currentState) !== JSON.stringify(updatedState)) {
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

// Set window ID for the timer
export const setTimerWindowIdAtom = atom(
  null,
  (get, set, windowId: string | null) => {
    set(timerAtom, (prev) => ({
      ...prev,
      windowId,
      isActive: windowId !== null,
    }));
  }
);

// Handle window minimize/restore
export const setTimerWindowMinimizedAtom = atom(
  null,
  (get, set, isMinimized: boolean) => {
    set(timerAtom, (prev) => ({
      ...prev,
      isMinimized,
      // Keep the timer active even when minimized
    }));
  }
);

// Handle window close - reset timer and clear window association
export const handleTimerWindowCloseAtom = atom(null, (get, set) => {
  set(timerAtom, (prev) => {
    const newTimeRemaining = getDurationForSetting(
      prev.timerSetting,
      prev.customDurationMinutes
    );
    return {
      ...prev,
      timeRemaining: newTimeRemaining,
      isRunning: false,
      windowId: null,
      isMinimized: false,
      isActive: false,
    };
  });
});
