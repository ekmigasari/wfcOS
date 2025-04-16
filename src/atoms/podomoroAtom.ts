import { atom } from "jotai";
import { loadFeatureState, saveFeatureState } from "../utils/storage";

const FEATURE_KEY = "podomoro";
const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes
const DEFAULT_SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK_TIME = 15 * 60; // 15 minutes
const DEFAULT_CUSTOM_MINUTES = 10; // Default custom time

export type TimerMode = "work" | "shortBreak" | "longBreak";
export type DurationSetting = "work25" | "short5" | "long15" | "custom";

// Define the shape of the Podomoro state
export interface PodomoroState {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  workSessionsCompleted: number;
  durationSetting: DurationSetting; // NEW: To track the selected duration mode
  customDurationMinutes: number; // NEW: To store the custom duration in minutes
}

// Helper function to get the correct duration in seconds based on the current state
// Logic: Settings determine cycle times.
// 'work25': 25 work, 5 short, 15 long
// 'short5': 5 work, 5 short, 5 long (simplest interpretation)
// 'long15': 15 work, 15 short, 15 long (simplest interpretation)
// 'custom': custom work, custom short, custom long (using same value)
const getDurationForMode = (
  mode: TimerMode,
  setting: DurationSetting,
  customMinutes: number
): number => {
  const safeCustomMinutes =
    customMinutes > 0 ? customMinutes : DEFAULT_CUSTOM_MINUTES;
  const customSeconds = safeCustomMinutes * 60;

  switch (setting) {
    case "work25":
      if (mode === "work") return DEFAULT_WORK_TIME;
      if (mode === "shortBreak") return DEFAULT_SHORT_BREAK_TIME;
      if (mode === "longBreak") return DEFAULT_LONG_BREAK_TIME;
      break; // Should not happen
    case "short5":
      // Simplification: Use 5 minutes for all phases in this setting
      return DEFAULT_SHORT_BREAK_TIME;
    case "long15":
      // Simplification: Use 15 minutes for all phases in this setting
      return DEFAULT_LONG_BREAK_TIME;
    case "custom":
      return customSeconds; // Use the same custom time for all phases
  }
  // Default fallback (should ideally not be reached if state is valid)
  return DEFAULT_WORK_TIME;
};

// Define the initial state (load from storage or use defaults)
const initialPodomoroState: PodomoroState = (() => {
  const savedState = loadFeatureState<PodomoroState>(FEATURE_KEY);

  // Define default values
  const defaults: Omit<PodomoroState, "timeRemaining"> = {
    mode: "work",
    isRunning: false, // Always start paused
    workSessionsCompleted: 0,
    durationSetting: "work25", // Default setting
    customDurationMinutes: DEFAULT_CUSTOM_MINUTES, // Default custom time
  };

  // Merge saved state with defaults, ensuring new fields have defaults
  const mergedState = {
    ...defaults,
    ...savedState,
    isRunning: false, // Crucial: ensure timer isn't running on load regardless of saved state
  };

  // Set initial timeRemaining based on merged mode and settings
  const initialTime = getDurationForMode(
    mergedState.mode,
    mergedState.durationSetting,
    mergedState.customDurationMinutes
  );

  return {
    ...mergedState,
    timeRemaining: initialTime,
  };
})();

// Create the base atom
const basePodomoroAtom = atom<PodomoroState>(initialPodomoroState);

// Create a derived atom that saves to localStorage on change
export const podomoroAtom = atom(
  (get) => get(basePodomoroAtom),
  (
    get,
    set,
    newState: PodomoroState | ((prevState: PodomoroState) => PodomoroState)
  ) => {
    const currentState = get(basePodomoroAtom);
    const updatedState =
      typeof newState === "function"
        ? newState(currentState) // Pass current state to the update function
        : newState;

    // Only update base atom and save if the state has actually changed
    if (JSON.stringify(currentState) !== JSON.stringify(updatedState)) {
      set(basePodomoroAtom, updatedState);
      saveFeatureState(FEATURE_KEY, updatedState);
    }
  }
);

// --- Action Helpers / Derived Atoms ---

export const startPausePodomoroAtom = atom(
  null, // write-only atom
  (get, set) => {
    set(podomoroAtom, (prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  }
);

export const resetPodomoroAtom = atom(null, (get, set) => {
  set(podomoroAtom, (prev) => {
    // Reset time based on current mode and duration settings
    const newTimeRemaining = getDurationForMode(
      prev.mode,
      prev.durationSetting,
      prev.customDurationMinutes
    );
    return {
      ...prev,
      timeRemaining: newTimeRemaining,
      isRunning: false, // Stop timer on reset
    };
  });
});

// Atom to explicitly set the duration setting
export const setDurationSettingAtom = atom(
  null,
  (get, set, newSetting: DurationSetting) => {
    set(podomoroAtom, (prev) => {
      // When changing setting, reset the timer to the start of the *current* mode with the *new* duration
      const newTimeRemaining = getDurationForMode(
        prev.mode,
        newSetting, // Use the new setting
        prev.customDurationMinutes
      );
      return {
        ...prev,
        durationSetting: newSetting,
        timeRemaining: newTimeRemaining,
        isRunning: false, // Stop timer on setting change
      };
    });
  }
);

// Atom to explicitly set the custom duration (in minutes)
export const setCustomDurationAtom = atom(
  null,
  (get, set, newMinutes: number) => {
    // Ensure the input is a valid number, default to DEFAULT_CUSTOM_MINUTES if not
    const parsedMinutes = Number(newMinutes);
    const validatedMinutes =
      Number.isNaN(parsedMinutes) || parsedMinutes <= 0
        ? DEFAULT_CUSTOM_MINUTES
        : parsedMinutes;

    set(podomoroAtom, (prev) => {
      let newTimeRemaining = prev.timeRemaining;
      let shouldStopTimer = false;

      // If currently using the 'custom' setting, update timer immediately and stop it
      if (prev.durationSetting === "custom") {
        newTimeRemaining = getDurationForMode(
          prev.mode,
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
          prev.durationSetting === "custom"
            ? newTimeRemaining
            : prev.timeRemaining,
        // Stop the timer if we changed the time while the custom setting was active
        isRunning: shouldStopTimer ? false : prev.isRunning,
      };
    });
  }
);

// Deprecate switchToModeAtom in favor of automatic switching via handlePodomoroTickCompletionAtom?
// Or keep it for manual overrides? Keep for now.
export const switchToModeAtom = atom(null, (get, set, newMode: TimerMode) => {
  set(podomoroAtom, (prev) => {
    // When switching mode manually, use the current duration settings
    const newTimeRemaining = getDurationForMode(
      newMode, // Use the target mode
      prev.durationSetting,
      prev.customDurationMinutes
    );
    // Reset sessions if switching back to work manually? Desirable? Let's say no.
    return {
      ...prev,
      mode: newMode,
      timeRemaining: newTimeRemaining,
      isRunning: false, // Stop timer on manual mode switch
      // workSessionsCompleted: newMode === 'work' ? 0 : prev.workSessionsCompleted // Optional: reset count on manual switch to work
    };
  });
});

// Atom to handle timer tick completion and mode switching
export const handlePodomoroTickCompletionAtom = atom(null, (get, set) => {
  const currentState = get(podomoroAtom);
  let newMode: TimerMode = "work";
  let sessions = currentState.workSessionsCompleted;

  if (currentState.mode === "work") {
    sessions += 1;
    // Determine next break type
    newMode = sessions > 0 && sessions % 4 === 0 ? "longBreak" : "shortBreak";
  } else {
    // After any break, switch back to work
    newMode = "work";
  }

  // Get the duration for the *new* mode based on current settings
  const newTimeRemaining = getDurationForMode(
    newMode,
    currentState.durationSetting,
    currentState.customDurationMinutes
  );

  set(podomoroAtom, (prev) => ({
    ...prev,
    mode: newMode,
    timeRemaining: newTimeRemaining,
    workSessionsCompleted: sessions, // Update session count
    isRunning: false, // Timer stops automatically when completed
  }));
});

// Atom to decrement time (should be called by the timer interval)
export const decrementPodomoroTimeAtom = atom(null, (get, set) => {
  set(podomoroAtom, (prev) => {
    if (!prev.isRunning || prev.timeRemaining <= 0) {
      return prev; // No change if not running or already at 0
    }
    return {
      ...prev,
      // Ensure time doesn't go below 0
      timeRemaining: Math.max(0, prev.timeRemaining - 1),
    };
  });
});
