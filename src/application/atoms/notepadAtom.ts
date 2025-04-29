import { atom } from "jotai";
import { loadFeatureState } from "../../infrastructure/utils/storage";

// Define keys for storage
export const NOTEPAD_STORAGE_KEY = "notepadContent";
export const NOTEPAD_SETTINGS_KEY = "notepadSettings";

// Define types
export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right" | "justify";
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  lineHeight: number;
  textColor: string;
  backgroundColor: string;
  tabSize: number;
  wordWrap: boolean;
  autoSaveInterval: number; // in seconds, 0 = disabled
}

// Default settings
export const defaultEditorSettings: EditorSettings = {
  fontSize: 14,
  fontFamily: "monospace",
  textAlign: "left",
  isBold: false,
  isItalic: false,
  isUnderline: false,
  lineHeight: 1.5,
  textColor: "#333333",
  backgroundColor: "#ffffff",
  tabSize: 2,
  wordWrap: true,
  autoSaveInterval: 30,
};

// Load initial content and settings from storage
// Note: We now only load the default instance's content and settings for atom initialization
// The individual editor instances will load their specific settings
const defaultInstanceId = "default";
const initialContent =
  loadFeatureState<string>(`${NOTEPAD_STORAGE_KEY}_${defaultInstanceId}`) || "";
const initialSettings =
  loadFeatureState<EditorSettings>(
    `${NOTEPAD_SETTINGS_KEY}_${defaultInstanceId}`
  ) || defaultEditorSettings;

// Create atoms
export const notepadContentAtom = atom<string>(initialContent);
export const notepadSettingsAtom = atom<EditorSettings>(initialSettings);

// Utility function to create a unique ID for each notepad instance
let nextId = 1;
export const getNextNotepadId = () => `notepad_${nextId++}`;

// Helper function to get editor settings for a specific instance
export const loadEditorSettings = (editorId: string): EditorSettings => {
  return (
    loadFeatureState<EditorSettings>(`${NOTEPAD_SETTINGS_KEY}_${editorId}`) ||
    defaultEditorSettings
  );
};

// Helper function to get editor content for a specific instance
export const loadEditorContent = (editorId: string): string => {
  return loadFeatureState<string>(`${NOTEPAD_STORAGE_KEY}_${editorId}`) || "";
};
