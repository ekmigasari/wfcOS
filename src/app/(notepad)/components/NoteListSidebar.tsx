"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  notesAtom,
  activeNoteIdAtom,
  createNewNote,
  deleteNote,
} from "@/application/atoms/notepadAtom";
import { Button } from "@/presentation/components/ui/button";
import { ScrollArea } from "@/presentation/components/ui/scroll-area";
import { cn } from "@/infrastructure/lib/utils";
import { Trash2, FilePlus } from "lucide-react"; // Import icons

export const NoteListSidebar = () => {
  const [notes, setNotes] = useAtom(notesAtom);
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);

  const handleCreateNote = () => {
    createNewNote(setNotes, setActiveNoteId);
  };

  const handleDeleteNote = (
    noteId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation(); // Prevent selection when clicking delete
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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
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
                  onClick={() => setActiveNoteId(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
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
                  <div className="flex-grow overflow-hidden mr-2">
                    <div className="font-medium truncate text-sm">
                      {note.name || "Untitled Note"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {formatTimestamp(note.lastModified)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 flex-shrink-0"
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
