/**
 * Storage utilities for localStorage persistence
 * This module provides helper functions for saving and loading feature state to/from localStorage
 */

// Base storage key prefix
const STORAGE_KEY_PREFIX = "wfcOS";

/**
 * Save state for a specific feature to localStorage
 * @param feature - Feature identifier
 * @param state - State object to save
 * @returns boolean indicating success
 */
export function saveFeatureState<T>(feature: string, state: T): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = `${STORAGE_KEY_PREFIX}.${feature}`;
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
    return true;
  } catch (error) {
    console.error(`Error saving ${feature} state:`, error);
    return false;
  }
}

/**
 * Load state for a specific feature from localStorage
 * @param feature - Feature identifier
 * @returns The loaded state or undefined if not found
 */
export function loadFeatureState<T>(feature: string): T | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const key = `${STORAGE_KEY_PREFIX}.${feature}`;
    const serializedState = localStorage.getItem(key);

    if (!serializedState) return undefined;

    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.error(`Error loading ${feature} state:`, error);
    return undefined;
  }
}

/**
 * Clear state for a specific feature from localStorage
 * @param feature - Feature identifier
 * @returns boolean indicating success
 */
export function clearFeatureState(feature: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = `${STORAGE_KEY_PREFIX}.${feature}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error clearing ${feature} state:`, error);
    return false;
  }
}

/**
 * Clear all app state from localStorage
 * @returns boolean indicating success
 */
export function clearAllAppState(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const keys = Object.keys(localStorage);

    // Remove only keys with our prefix
    keys
      .filter((key) => key.startsWith(`${STORAGE_KEY_PREFIX}.`))
      .forEach((key) => localStorage.removeItem(key));

    return true;
  } catch (error) {
    console.error("Error clearing all app state:", error);
    return false;
  }
}

/**
 * Get all saved features
 * @returns Array of feature names that have saved state
 */
export function getSavedFeatures(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const keys = Object.keys(localStorage);
    const prefix = `${STORAGE_KEY_PREFIX}.`;

    return keys
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.substring(prefix.length));
  } catch (error) {
    console.error("Error getting saved features:", error);
    return [];
  }
}
