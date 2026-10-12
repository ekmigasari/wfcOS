"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import {
  activeNoteIdAtom,
  createNewNote,
  notesAtom,
} from "@/application/atoms/notepadAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { NoteListSidebar } from "./components/NoteListSidebar";

const loadNotepadEditor = () =>
  import("./components/NotepadEditor").then((mod) => mod.NotepadEditor);

export const preloadNotepadAssets = async () => {
  await loadNotepadEditor();
};

const NotepadEditor = dynamic(loadNotepadEditor, {
  ssr: false,
  loading: () => (
    <div className="grow flex items-center justify-center text-gray-500 bg-gray-50">
      <p>Loading editor...</p>
    </div>
  ),
});

const Notepad: React.FC = () => {
  const notes = useAtomValue(notesAtom);
  const activeNoteId = useAtomValue(activeNoteIdAtom);
  const setNotes = useSetAtom(notesAtom);
  const setActiveNoteId = useSetAtom(activeNoteIdAtom);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (notes.length === 0) {
      createNewNote(setNotes, setActiveNoteId);
      return;
    }

    if (!activeNoteId || !notes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes, setActiveNoteId, setNotes]);

  const toggleSidebar = useCallback(() => {
    playSound("/sounds/click.mp3");
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="w-full h-full flex relative border border-gray-300 rounded shadow overflow-hidden">
      {isSidebarOpen ? <NoteListSidebar /> : null}

      <div
        onClick={toggleSidebar}
        className="group flex flex-col items-center justify-center h-full w-5 border-l border-r border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 select-none"
        title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <div className="flex flex-col h-16 justify-center items-center">
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </div>

      <div className="grow flex flex-col h-full">
        {activeNoteId ? (
          <NotepadEditor activeNoteId={activeNoteId} />
        ) : (
          <div className="grow flex items-center justify-center text-gray-500 bg-gray-50">
            {notes.length > 0 ? (
              <p>Loading note...</p>
            ) : (
              <p>Create a new note to start editing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;
