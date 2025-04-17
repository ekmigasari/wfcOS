const BASE_STORAGE_KEY = "wfcOS_state";

// Helper to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  return typeof window !== "undefined" && window.localStorage !== undefined;
};

// Helper to get the specific key for a feature
const getFeatureKey = (feature: string): string =>
  `${BASE_STORAGE_KEY}_${feature}`;

// Save state for a specific feature
export const saveFeatureState = <T>(feature: string, state: T): void => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(getFeatureKey(feature), serializedState);
  } catch (error) {
    console.error(
      `Could not save state for feature '${feature}' to localStorage:`,
      error
    );
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
    // It might be better to return undefined or throw an error depending on expected usage
    return undefined;
  }
};

// Clear state for a specific feature
export const clearFeatureState = (feature: string): void => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return;
  }

  try {
    localStorage.removeItem(getFeatureKey(feature));
  } catch (error) {
    console.error(
      `Could not clear state for feature '${feature}' from localStorage:`,
      error
    );
  }
};

// Optional: Clear all app state if needed later
export const clearAllAppState = (): void => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return;
  }

  try {
    // Get all keys related to the app
    Object.keys(localStorage)
      .filter((key) => key.startsWith(BASE_STORAGE_KEY))
      .forEach((key) => localStorage.removeItem(key));
    console.log("Cleared all wfcOS state from localStorage.");
  } catch (error) {
    console.error("Could not clear all app state from localStorage:", error);
  }
};
