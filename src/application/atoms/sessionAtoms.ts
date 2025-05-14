import { atom } from "jotai";

import { Session } from "@/application/types/session.types";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

const FEATURE_KEY = "work_sessions";

// Load initial state from localStorage or use default (empty array)
const initialSessions = loadFeatureState<Session[]>(FEATURE_KEY) ?? [];

// Create the base atom for sessions
const baseSessionsAtom = atom<Session[]>(initialSessions);

// Create a derived atom that saves to localStorage on change
export const sessionsAtom = atom(
  (get) => get(baseSessionsAtom),
  (
    get,
    set,
    newSessions: Session[] | ((prevSessions: Session[]) => Session[])
  ) => {
    const updatedSessions =
      typeof newSessions === "function"
        ? newSessions(get(baseSessionsAtom))
        : newSessions;
    set(baseSessionsAtom, updatedSessions);
    saveFeatureState(FEATURE_KEY, updatedSessions);
  }
);

// Atom to store the ID of the task selected for the current timer session
export const selectedTaskForTimerAtom = atom<string | null>(null);

// Helper to add a session
// Expects duration in minutes
export const addSessionAtom = atom(
  null,
  (get, set, sessionData: Omit<Session, "id" | "date">) => {
    const startDate = new Date(sessionData.startTime);
    const localDateString = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;

    const newSession: Session = {
      ...sessionData,
      id: crypto.randomUUID(),
      date: localDateString, // Store local date string
    };
    set(sessionsAtom, (prevSessions) => [newSession, ...prevSessions]); // Add to top for chronological view by default
  }
);

// Helper to delete a session
export const deleteSessionAtom = atom(null, (get, set, sessionId: string) => {
  set(sessionsAtom, (prevSessions) =>
    prevSessions.filter((session) => session.id !== sessionId)
  );
});

// Derived atom to get session count for a specific task (Option B: Calculate dynamically)
export const getTaskSessionCountAtom = atom((get) => (taskId: string) => {
  const allSessions = get(sessionsAtom);
  return allSessions.filter((session) => session.taskId === taskId).length;
});

// Derived atom to get all sessions sorted by startTime descending (newest first)
export const sortedSessionsAtom = atom((get) => {
  const sessions = get(sessionsAtom);
  return [...sessions].sort((a, b) => b.startTime - a.startTime);
});
