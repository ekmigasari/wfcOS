"use client";

import { useAtom } from "jotai";
import { FilePlus, Pencil, Search, Trash2, X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  activeNoteIdAtom,
  createNewNote,
  deleteNote,
  getNotePreview,
  notesAtom,
  updateNoteName,
} from "@/application/atoms/notepadAtom";
import { cn, playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { ScrollArea } from "@/presentation/components/ui/scroll-area";

// Constants for resizing
const MIN_WIDTH = 180; // Minimum sidebar width in pixels
const MAX_WIDTH = 420; // Maximum sidebar width in pixels

interface NoteListSidebarProps {
  // Fixed width + resize callbacks; omit for a fluid (non-resizable) sidebar
  width?: number;
  onWidthChange?: (width: number) => void;
  onResizingChange?: (isResizing: boolean) => void;
  // Called after the user picks or creates a note
  onNoteSelected?: () => void;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
};

export const NoteListSidebar = ({
  width,
  onWidthChange,
  onResizingChange,
  onNoteSelected,
}: NoteListSidebarProps) => {
  const [notes, setNotes] = useAtom(notesAtom);
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const isResizable = width !== undefined && onWidthChange !== undefined;

  useEffect(() => {
    if (editingNoteId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingNoteId]);

  useEffect(() => {
    onResizingChange?.(isResizing);
  }, [isResizing, onResizingChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "default";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!sidebarRef.current) return;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const newWidth = Math.max(
        MIN_WIDTH,
        Math.min(e.clientX - sidebarRect.left, MAX_WIDTH)
      );
      onWidthChange?.(Math.round(newWidth));
    },
    [onWidthChange]
  );

  // Add and remove global mouse listeners for resizing
  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const withPreview = notes.map((note) => ({
      ...note,
      preview: getNotePreview(note.content),
    }));
    if (!normalized) return withPreview;
    return withPreview.filter(
      (note) =>
        note.name.toLowerCase().includes(normalized) ||
        note.preview.toLowerCase().includes(normalized)
    );
  }, [notes, query]);

  const selectNote = (noteId: string) => {
    if (editingNoteId === noteId) return;
    playSound("/sounds/click.mp3");
    setActiveNoteId(noteId);
    onNoteSelected?.();
  };

  const handleCreateNote = () => {
    playSound("/sounds/click.mp3");
    setQuery("");
    const newNoteId = createNewNote(setNotes, setActiveNoteId);
    setEditingNoteId(newNoteId);
    setEditedName("New Note");
  };

  const handleDeleteNote = (
    noteId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    playSound("/sounds/click.mp3");
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
    }
    if (
      window.confirm(
        `Are you sure you want to delete "${
          notes.find((n) => n.id === noteId)?.name ?? "this note"
        }"?`
      )
    ) {
      deleteNote(setNotes, setActiveNoteId, noteId);
    }
  };

  const handleSaveName = (noteId: string) => {
    if (editingNoteId === noteId && editedName.trim() !== "") {
      playSound("/sounds/click.mp3");
      updateNoteName(setNotes, noteId, editedName.trim());
    }
    setEditingNoteId(null);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    noteId: string
  ) => {
    if (event.key === "Enter") {
      handleSaveName(noteId);
    } else if (event.key === "Escape") {
      setEditingNoteId(null);
    }
  };

  const handleStartEditing = (
    noteId: string,
    currentName: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.stopPropagation();
    playSound("/sounds/click.mp3");
    setEditingNoteId(noteId);
    setEditedName(currentName || "Untitled Note");
  };

  return (
    <div
      ref={sidebarRef}
      className="relative border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden"
      style={isResizable ? { width } : { width: "100%" }}
    >
      {isResizable && (
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-col-resize z-10 transition-colors hover:bg-blue-200",
            isResizing && "bg-blue-300"
          )}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
      )}

      <div className="flex items-center justify-between gap-2 h-10 pl-3 pr-1.5 border-b border-gray-200 bg-gray-100 shrink-0">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <h2 className="text-sm font-semibold text-gray-800">Notes</h2>
          <span className="text-xs text-gray-500">{notes.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNote}
          title="New note"
          className="h-7 w-7 text-gray-600"
        >
          <FilePlus className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search notes"
            className="w-full h-8 pl-7 pr-7 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grow overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="px-2 pb-2">
            {filteredNotes.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                {notes.length === 0 ? "No notes yet." : "No matching notes."}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {filteredNotes.map((note) => {
                  const isActive = activeNoteId === note.id;
                  return (
                    <li key={note.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-current={isActive}
                        onClick={() => selectNote(note.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectNote(note.id);
                          }
                        }}
                        className={cn(
                          "group relative flex items-start gap-1 w-full pl-3 pr-1.5 py-2 rounded-md text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                          isActive
                            ? "bg-white shadow-sm ring-1 ring-gray-200"
                            : "hover:bg-gray-100"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500" />
                        )}
                        <div className="grow min-w-0">
                          {editingNoteId === note.id ? (
                            <Input
                              ref={inputRef}
                              value={editedName}
                              onBlur={() => handleSaveName(note.id)}
                              onChange={(e) => setEditedName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, note.id)}
                              onFocus={(e) => e.target.select()}
                              className="h-7 py-1 px-1.5 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span
                                  className={cn(
                                    "grow truncate text-sm",
                                    isActive
                                      ? "font-semibold text-gray-900"
                                      : "font-medium text-gray-800"
                                  )}
                                >
                                  {note.name || "Untitled Note"}
                                </span>
                                <span className="shrink-0 text-[11px] text-gray-400 group-hover:hidden group-focus-within:hidden">
                                  {formatTimestamp(note.lastModified)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {note.preview || "Empty note"}
                              </div>
                            </>
                          )}
                        </div>
                        {editingNoteId !== note.id && (
                          <div className="hidden group-hover:flex group-focus-within:flex shrink-0 items-center -my-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              onClick={(e) =>
                                handleStartEditing(note.id, note.name, e)
                              }
                              title="Rename note"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              title="Delete note"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
