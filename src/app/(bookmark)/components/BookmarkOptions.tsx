"use client";

import { Edit, Trash2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface BookmarkOptionsProps {
  bookmarkId: string;
  position: { top: number; left: number };
  onEdit: () => void; // Callback to trigger edit mode in parent
  onDelete: (id: string) => void; // Callback to trigger delete in parent
  onClose: () => void; // Callback to close the menu
}

export const BookmarkOptions = ({
  bookmarkId,
  position,
  onEdit,
  onDelete,
  onClose,
}: BookmarkOptionsProps) => {
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Add listener on mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]); // Depend only on onClose callback

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    onClose(); // Close menu after action
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(bookmarkId);
    onClose(); // Close menu after action
  };

  return (
    <div
      ref={optionsRef}
      className="w-32 bg-card rounded-md shadow-lg border border-border"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
        transform: "translateZ(0)",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it via body listener
    >
      <button
        onClick={handleEditClick}
        className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-accent/50 transition-colors rounded-t-md"
      >
        <Edit size={14} />
        <span>Edit</span>
      </button>
      <button
        onClick={handleDeleteClick}
        className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-destructive/10 hover:text-destructive transition-colors rounded-b-md"
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
};
