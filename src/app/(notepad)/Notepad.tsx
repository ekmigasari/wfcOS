"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { PanelLeftClose, PanelLeftOpen, SquarePen } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  activeNoteIdAtom,
  createNewNote,
  notepadSidebarAtom,
  notesAtom,
  updateNoteName,
} from "@/application/atoms/notepadAtom";
import { cn, playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
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

// Below this container width the sidebar floats over the editor instead of
// squeezing it.
const COMPACT_BREAKPOINT = 560;

const NoteTitle = ({ noteId, name }: { noteId: string; name: string }) => {
  const setNotes = useSetAtom(notesAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEditing = () => {
    setDraft(name || "Untitled Note");
    setIsEditing(true);
  };

  const commit = () => {
    if (draft.trim() && draft.trim() !== name) {
      playSound("/sounds/click.mp3");
      updateNoteName(setNotes, noteId, draft.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setIsEditing(false);
        }}
        className="min-w-0 flex-1 h-7 px-2 text-sm font-medium rounded border border-blue-300 bg-white outline-none focus:ring-2 focus:ring-blue-200"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Click to rename"
      className="min-w-0 flex-1 h-7 px-2 text-left text-sm font-medium text-gray-800 truncate rounded hover:bg-gray-200/70 transition-colors"
    >
      {name || "Untitled Note"}
    </button>
  );
};

const Notepad: React.FC = () => {
  const notes = useAtomValue(notesAtom);
  const activeNoteId = useAtomValue(activeNoteIdAtom);
  const setNotes = useSetAtom(notesAtom);
  const setActiveNoteId = useSetAtom(activeNoteIdAtom);
  const [sidebar, setSidebar] = useAtom(notepadSidebarAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  // In compact mode the sidebar is a temporary overlay, independent of the
  // persisted preference used in wide mode.
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (notes.length === 0) {
      createNewNote(setNotes, setActiveNoteId);
      return;
    }

    if (!activeNoteId || !notes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes, setActiveNoteId, setNotes]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setIsCompact(entry.contentRect.width < COMPACT_BREAKPOINT);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isSidebarVisible = isCompact ? isOverlayOpen : sidebar.isOpen;

  const toggleSidebar = useCallback(() => {
    playSound("/sounds/click.mp3");
    if (isCompact) {
      setIsOverlayOpen((prev) => !prev);
    } else {
      setSidebar({ isOpen: !sidebar.isOpen });
    }
  }, [isCompact, setSidebar, sidebar.isOpen]);

  const handleWidthChange = useCallback(
    (width: number) => setSidebar({ width }),
    [setSidebar]
  );

  const closeOverlay = useCallback(() => setIsOverlayOpen(false), []);

  const handleNewNote = () => {
    playSound("/sounds/click.mp3");
    createNewNote(setNotes, setActiveNoteId);
    if (isCompact) setIsOverlayOpen(false);
  };

  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex relative border border-gray-300 rounded shadow overflow-hidden bg-white"
    >
      {/* Wide mode: inline sidebar that pushes the editor */}
      {!isCompact && (
        <div
          className={cn(
            "h-full shrink-0 overflow-hidden",
            !isResizing && "transition-[width] duration-200 ease-out"
          )}
          style={{ width: isSidebarVisible ? sidebar.width : 0 }}
          inert={!isSidebarVisible}
        >
          <NoteListSidebar
            width={sidebar.width}
            onWidthChange={handleWidthChange}
            onResizingChange={setIsResizing}
          />
        </div>
      )}

      {/* Compact mode: floating sidebar over the editor */}
      {isCompact && (
        <>
          <div
            onClick={closeOverlay}
            className={cn(
              "absolute inset-0 z-20 bg-black/20 transition-opacity duration-200",
              isSidebarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 z-30 w-[80%] max-w-[280px] transition-transform duration-200 ease-out",
              isSidebarVisible
                ? "translate-x-0 shadow-xl"
                : "-translate-x-full shadow-none"
            )}
            inert={!isSidebarVisible}
          >
            <NoteListSidebar onNoteSelected={closeOverlay} />
          </div>
        </>
      )}

      <div className="grow min-w-0 flex flex-col h-full">
        <div className="flex items-center gap-1 h-10 px-1.5 border-b border-gray-200 bg-gray-100 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={isSidebarVisible ? "Hide notes" : "Show notes"}
            className="h-7 w-7 shrink-0 text-gray-600"
          >
            {isSidebarVisible ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          {!isSidebarVisible && notes.length > 1 && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="shrink-0 h-5 px-1.5 text-[11px] font-medium rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              title={`${notes.length} notes`}
            >
              {notes.length}
            </button>
          )}
          {activeNote ? (
            <NoteTitle
              key={activeNote.id}
              noteId={activeNote.id}
              name={activeNote.name}
            />
          ) : (
            <div className="flex-1" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewNote}
            title="New note"
            className="h-7 w-7 shrink-0 text-gray-600"
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>

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
