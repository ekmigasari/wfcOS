"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import {
  notesAtom,
  activeNoteIdAtom,
  createNewNote,
  deleteNote,
  updateNoteName,
} from "@/application/atoms/notepadAtom";
import { Button } from "@/presentation/components/ui/button";
import { ScrollArea } from "@/presentation/components/ui/scroll-area";
import { Input } from "@/presentation/components/ui/input";
import { cn } from "@/infrastructure/lib/utils";
import { Trash2, FilePlus } from "lucide-react";

// Constants for resizing
const MIN_WIDTH = 150; // Minimum sidebar width in pixels
const MAX_WIDTH = 500; // Maximum sidebar width in pixels
const DEFAULT_WIDTH = 256; // Default width (w-64)

export const NoteListSidebar = () => {
  const [notes, setNotes] = useAtom(notesAtom);
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // Load saved width from local storage (optional, can be added later)
  // useEffect(() => {
  //   const savedWidth = localStorage.getItem("notepadSidebarWidth");
  //   if (savedWidth) {
  //     setSidebarWidth(parseInt(savedWidth, 10));
  //   }
  // }, []);

  // Save width to local storage (optional)
  // useEffect(() => {
  //   localStorage.setItem("notepadSidebarWidth", sidebarWidth.toString());
  // }, [sidebarWidth]);

  useEffect(() => {
    if (editingNoteId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingNoteId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize"; // Change cursor during resize
  };

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = "default"; // Restore default cursor
    }
  }, [isResizing]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const currentX = e.clientX;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      // Calculate new width relative to the sidebar's left edge
      let newWidth = currentX - sidebarRect.left;

      // Clamp the width within min/max bounds
      newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));

      setSidebarWidth(newWidth);
    },
    [isResizing]
  );

  // Add and remove global mouse listeners for resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default"; // Ensure cursor is reset on unmount
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleCreateNote = () => {
    const newNoteId = createNewNote(setNotes, setActiveNoteId);
    setEditingNoteId(newNoteId);
    setEditedName("New Note");
  };

  const handleDeleteNote = (
    noteId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
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

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(event.target.value);
  };

  const handleSaveName = (noteId: string) => {
    if (editingNoteId === noteId && editedName.trim() !== "") {
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
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    setEditingNoteId(noteId);
    setEditedName(currentName || "Untitled Note");
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      ref={sidebarRef}
      className="relative border-r border-gray-200 bg-gray-50 flex flex-col h-full"
      style={{ width: `${sidebarWidth}px`, flexShrink: 0 }} // Apply dynamic width and prevent shrinking
    >
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-blue-200 active:bg-blue-300 z-10"
        onMouseDown={handleMouseDown}
        title="Resize Sidebar"
      />

      <div className="p-2 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNote}
          title="New Note"
        >
          <FilePlus className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notes yet.</div>
        ) : (
          <ul className="p-2 space-y-1">
            {notes.map((note) => (
              <li key={note.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (editingNoteId !== note.id) {
                      setActiveNoteId(note.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      editingNoteId !== note.id &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      setActiveNoteId(note.id);
                    }
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-300 flex justify-between items-start group cursor-pointer",
                    activeNoteId === note.id
                      ? "bg-blue-100 hover:bg-blue-200"
                      : ""
                  )}
                >
                  <div className="flex-grow overflow-hidden mr-2 w-0">
                    {editingNoteId === note.id ? (
                      <Input
                        ref={inputRef}
                        value={editedName}
                        onBlur={() => handleSaveName(note.id)}
                        onChange={handleNameChange}
                        onKeyDown={(e) => handleKeyDown(e, note.id)}
                        onFocus={(e) => e.target.select()}
                        className="h-7 py-1 px-1.5 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <div
                          className="font-medium truncate text-sm cursor-text"
                          onClick={(e) =>
                            handleStartEditing(note.id, note.name, e)
                          }
                        >
                          {note.name || "Untitled Note"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatTimestamp(note.lastModified)}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Ensure button doesn't shrink when sidebar is narrow */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-red-500 hover:bg-red-100 flex-shrink-0",
                      // Make delete button visible if focused, even if not hovering
                      activeNoteId === note.id && "opacity-100" // Keep visible on active for narrow widths
                    )}
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
};
