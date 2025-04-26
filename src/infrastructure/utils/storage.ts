const BASE_STORAGE_KEY = "wfcOS_state";

// Helper to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    // Additional check for SSR
    if (typeof window === "undefined") return false;

    // Check if localStorage exists
    if (!window.localStorage) return false;

    // Perform a test to confirm it's working
    const testKey = `${BASE_STORAGE_KEY}_test`;
    window.localStorage.setItem(testKey, "_");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error("Error checking localStorage:", e);
    return false; // Error accessing localStorage (could be disabled or in private mode)
  }
};

// Helper to get the specific key for a feature
const getFeatureKey = (feature: string): string =>
  `${BASE_STORAGE_KEY}_${feature}`;

// Save state for a specific feature
export const saveFeatureState = <T>(feature: string, state: T): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(getFeatureKey(feature), serializedState);
    return true;
  } catch (error) {
    console.error(
      `Could not save state for feature '${feature}' to localStorage:`,
      error
    );
    return false;
  }
};

// Load state for a specific feature
export const loadFeatureState = <T>(feature: string): T | undefined => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem(getFeatureKey(feature));
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.error(
      `Could not load state for feature '${feature}' from localStorage:`,
      error
    );
    return undefined;
  }
};

// Clear state for a specific feature
export const clearFeatureState = (feature: string): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    localStorage.removeItem(getFeatureKey(feature));
    return true;
  } catch (error) {
    console.error(
      `Could not clear state for feature '${feature}' from localStorage:`,
      error
    );
    return false;
  }
};

// Optional: Clear all app state if needed later
export const clearAllAppState = (): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    // Get all keys related to the app
    Object.keys(localStorage)
      .filter((key) => key.startsWith(BASE_STORAGE_KEY))
      .forEach((key) => localStorage.removeItem(key));
    console.log("Cleared all wfcOS state from localStorage.");
    return true;
  } catch (error) {
    console.error("Could not clear all app state from localStorage:", error);
    return false;
  }
};
