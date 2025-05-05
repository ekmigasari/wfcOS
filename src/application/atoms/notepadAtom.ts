import { atom } from "jotai";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";
import { LexicalEditor, $getRoot } from "lexical";

// Define the structure for a single note
export interface Note {
  id: string;
  name: string; // Can be derived from content or user-defined
  content: string; // Serialized Lexical EditorState JSON string
  lastModified: number; // Timestamp
}

// Storage keys
export const NOTEPAD_NOTES_LIST_KEY = "notepad_notes_list";
export const NOTEPAD_ACTIVE_NOTE_ID_KEY = "notepad_active_note_id";

// Helper to generate unique IDs
const generateId = () =>
  `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- Atoms ---

// Atom for the list of all notes
const baseNotesAtom = atom<Note[]>(
  loadFeatureState<Note[]>(NOTEPAD_NOTES_LIST_KEY) ?? []
);
export const notesAtom = atom(
  (get) => get(baseNotesAtom).sort((a, b) => b.lastModified - a.lastModified), // Keep notes sorted by last modified
  (get, set, update: Note[] | ((prev: Note[]) => Note[])) => {
    const newNotes =
      typeof update === "function" ? update(get(baseNotesAtom)) : update;
    set(baseNotesAtom, newNotes);
    saveFeatureState(NOTEPAD_NOTES_LIST_KEY, newNotes);
  }
);

// Atom for the ID of the currently active/selected note
const baseActiveNoteIdAtom = atom<string | null>(
  loadFeatureState<string | null>(NOTEPAD_ACTIVE_NOTE_ID_KEY) ?? null
);
export const activeNoteIdAtom = atom(
  (get) => {
    const activeId = get(baseActiveNoteIdAtom);
    const notes = get(notesAtom);
    // Ensure the active ID exists in the notes list, otherwise select the first or null
    if (activeId && notes.some((note) => note.id === activeId)) {
      return activeId;
    }
    return notes[0]?.id ?? null;
  },
  (get, set, newId: string | null) => {
    set(baseActiveNoteIdAtom, newId);
    saveFeatureState(NOTEPAD_ACTIVE_NOTE_ID_KEY, newId);
  }
);

// Derived atom to get the content of the active note
export const activeNoteContentAtom = atom<string | null>((get) => {
  const activeId = get(activeNoteIdAtom);
  const notes = get(notesAtom);
  return notes.find((note) => note.id === activeId)?.content ?? null;
});

// --- Action Atoms ---

// Atom to handle saving the active note content and deriving its name
export const saveActiveNoteAtom = atom(
  null,
  (get, set, payload: { content: string; editor: LexicalEditor }) => {
    const activeId = get(activeNoteIdAtom);
    if (!activeId) return;

    const { content: newContent, editor } = payload;
    let noteName = "Untitled Note";

    try {
      // Use public API within read() callback
      editor.getEditorState().read(() => {
        const root = $getRoot(); // Get the root node
        const firstChild = root.getFirstChild(); // Get the first child of the root

        if (firstChild && firstChild.getTextContent) {
          const text = firstChild.getTextContent().trim();
          if (text) {
            noteName = text.substring(0, 50); // Limit name length
          }
        }
      });
    } catch (e) {
      console.warn("Could not derive note name from content:", e);
    }

    set(notesAtom, (prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeId
          ? {
              ...note,
              content: newContent,
              name: noteName || note.name,
              lastModified: Date.now(),
            }
          : note
      )
    );
  }
);

// --- Utility Functions ---

// Function to create a new note
export const createNewNote = (
  setNotes: (update: Note[] | ((prev: Note[]) => Note[])) => void,
  setActiveNoteId: (update: string | null) => void
) => {
  const newNote: Note = {
    id: generateId(),
    name: "New Note",
    content:
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}', // Basic empty state
    lastModified: Date.now(),
  };
  setNotes((prevNotes) => [newNote, ...prevNotes]);
  setActiveNoteId(newNote.id);
  return newNote.id;
};

// Function to delete a note
export const deleteNote = (
  setNotes: (update: Note[] | ((prev: Note[]) => Note[])) => void,
  setActiveNoteId: (update: string | null) => void,
  noteIdToDelete: string
) => {
  let nextActiveId: string | null = null;
  setNotes((prevNotes) => {
    const indexToDelete = prevNotes.findIndex(
      (note) => note.id === noteIdToDelete
    );
    if (indexToDelete === -1) return prevNotes; // Note not found

    // Determine the next active note (previous or next in the list)
    if (prevNotes.length > 1) {
      nextActiveId =
        indexToDelete > 0
          ? prevNotes[indexToDelete - 1].id // Select previous
          : prevNotes[indexToDelete + 1].id; // Select next
    }

    return prevNotes.filter((note) => note.id !== noteIdToDelete);
  });
  setActiveNoteId(nextActiveId); // Set the new active note
};

// Note: The EditorSettings atom is removed as formatting is now part of the Lexical state.
// If global settings unrelated to content are needed (e.g., theme), add new atoms.

// Example: Load content (used by editor setup)
export const loadNoteContent = (
  noteId: string | null,
  notes: Note[]
): string | null => {
  if (!noteId) return null;
  return notes.find((note) => note.id === noteId)?.content ?? null;
};
