import { atom } from "jotai";
import { LexicalEditor } from "lexical";
import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

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
export const NOTEPAD_SIDEBAR_KEY = "notepad_sidebar";

// Helper to generate unique IDs
const generateId = () =>
  `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- Atoms ---

// Atom for the list of all notes
const baseNotesAtom = atom<Note[]>(
  loadFeatureState<Note[]>(NOTEPAD_NOTES_LIST_KEY) ?? []
);
// Keep notes sorted by last modified (copy to avoid mutating stored state)
const sortNotes = (notes: Note[]) =>
  [...notes].sort((a, b) => b.lastModified - a.lastModified);

export const notesAtom = atom(
  (get) => sortNotes(get(baseNotesAtom)),
  (get, set, update: Note[] | ((prev: Note[]) => Note[])) => {
    const newNotes =
      typeof update === "function"
        ? update(sortNotes(get(baseNotesAtom)))
        : update;
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

// Sidebar UI preferences (open state + width), persisted across sessions
export interface NotepadSidebarState {
  isOpen: boolean;
  width: number;
}

export const NOTEPAD_SIDEBAR_DEFAULT_WIDTH = 240;

const baseSidebarStateAtom = atom<NotepadSidebarState>({
  isOpen: true,
  width: NOTEPAD_SIDEBAR_DEFAULT_WIDTH,
  ...loadFeatureState<Partial<NotepadSidebarState>>(NOTEPAD_SIDEBAR_KEY),
});
export const notepadSidebarAtom = atom(
  (get) => get(baseSidebarStateAtom),
  (get, set, update: Partial<NotepadSidebarState>) => {
    const next = { ...get(baseSidebarStateAtom), ...update };
    set(baseSidebarStateAtom, next);
    saveFeatureState(NOTEPAD_SIDEBAR_KEY, next);
  }
);

// --- Action Atoms ---

// Atom to handle saving the active note content and deriving its name
export const saveActiveNoteAtom = atom(
  null,
  (
    get,
    set,
    payload: { content: string; editor?: LexicalEditor; noteId?: string }
  ) => {
    const noteIdToSave = payload.noteId ?? get(activeNoteIdAtom);
    if (!noteIdToSave) return;

    const { content: newContent } = payload;

    set(notesAtom, (prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteIdToSave
          ? {
              ...note,
              content: newContent,
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

// Function to update a note's name
export const updateNoteName = (
  setNotes: (update: Note[] | ((prev: Note[]) => Note[])) => void,
  noteIdToUpdate: string,
  newName: string
) => {
  setNotes((prevNotes) =>
    prevNotes.map((note) =>
      note.id === noteIdToUpdate
        ? {
            ...note,
            name: newName.trim() || "Untitled Note", // Ensure name isn't empty
            lastModified: Date.now(), // Update timestamp on name change
          }
        : note
    )
  );
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

interface SerializedLexicalNode {
  text?: string;
  children?: SerializedLexicalNode[];
}

// Extract a short plain-text preview from serialized Lexical state
export const getNotePreview = (content: string, maxLength = 80): string => {
  try {
    const root = (JSON.parse(content) as { root?: SerializedLexicalNode }).root;
    const parts: string[] = [];
    let length = 0;
    const walk = (node: SerializedLexicalNode) => {
      if (length >= maxLength) return;
      if (node.text) {
        parts.push(node.text);
        length += node.text.length;
      }
      node.children?.forEach((child) => {
        walk(child);
        if (child.children && length < maxLength) {
          parts.push(" ");
        }
      });
    };
    if (root) walk(root);
    return parts.join("").replace(/\s+/g, " ").trim().slice(0, maxLength);
  } catch {
    return "";
  }
};
