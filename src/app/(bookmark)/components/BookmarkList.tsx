"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtom } from "jotai";
import { GripVertical, MoreVertical } from "lucide-react";
import { useRef, useState } from "react";

import {
  BookmarkItem,
  bookmarksAtom,
  deleteBookmarkAtom,
} from "@/application/atoms/bookmarkAtom";
import { playSound } from "@/infrastructure/lib/utils";

import { BookmarkOptions } from "./BookmarkOptions";

// --- Type for the state holding active options data ---
interface ActiveOptionsState {
  bookmarkId: string;
  position: { top: number; left: number };
  bookmark: BookmarkItem; // Include full bookmark for edit callback
}

interface SortableBookmarkItemProps {
  bookmark: BookmarkItem;
  onShowOptions: (data: ActiveOptionsState | null) => void; // Callback to show/hide options at parent level
}

const SortableBookmarkItem = ({
  bookmark,
  onShowOptions,
}: SortableBookmarkItemProps) => {
  // Removed state for showOptions and menuPosition
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  const handleOpenLink = () => {
    playSound("/sounds/click.mp3");
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  // --- Updated toggleOptions to call parent callback ---
  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("/sounds/click.mp3");
    if (optionsButtonRef.current) {
      const rect = optionsButtonRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 100,
      };
      // Call parent to show options for this item
      onShowOptions({ bookmarkId: bookmark.id, position, bookmark });
    } else {
      // Fallback or error handling if ref not available
      onShowOptions(null); // Ensure any open options are closed
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 mb-2 bg-card rounded-md border border-border shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab mr-2 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </div>

      {/* Bookmark Info (Clickable) */}
      <div
        className="flex-1 min-w-0 mr-4 cursor-pointer"
        onClick={handleOpenLink}
      >
        <h3 className="font-medium truncate" title={bookmark.name}>
          {bookmark.name}
        </h3>
        <p
          className="text-xs text-muted-foreground truncate"
          title={bookmark.url}
        >
          {bookmark.url}
        </p>
      </div>

      {/* Actions Container */}
      <div className="flex items-center gap-1">
        {/* Options Button - triggers parent state update */}
        <div className="relative">
          <button
            ref={optionsButtonRef}
            onClick={handleOptionsClick} // Use updated handler
            title="More options"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Options menu is no longer rendered here */}
      </div>
    </div>
  );
};

// --- Updated BookmarkList component ---
export interface BookmarkListProps {
  onEdit: (bookmark: BookmarkItem) => void; // Passed to BookmarkOptions
}

export const BookmarkList = ({ onEdit }: BookmarkListProps) => {
  const [bookmarks] = useAtom(bookmarksAtom);
  const [, deleteBookmark] = useAtom(deleteBookmarkAtom); // Get delete atom here
  const [activeOptions, setActiveOptions] = useState<ActiveOptionsState | null>(
    null
  );

  const handleShowOptions = (data: ActiveOptionsState | null) => {
    setActiveOptions(data);
  };

  const handleCloseOptions = () => {
    setActiveOptions(null);
  };

  // Handle edit request from BookmarkOptions
  const handleEdit = () => {
    if (activeOptions) {
      onEdit(activeOptions.bookmark); // Call the original onEdit passed from Bookmark.tsx
    }
  };

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    // Added position relative to potentially help stacking context if needed
    <div className="space-y-1 relative">
      {bookmarks.map((bookmark) => (
        <SortableBookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onShowOptions={handleShowOptions}
        />
      ))}

      {/* Render BookmarkOptions at the list level */}
      {activeOptions && (
        <BookmarkOptions
          bookmarkId={activeOptions.bookmarkId}
          position={activeOptions.position}
          onEdit={handleEdit} // Use the specific handler
          onDelete={deleteBookmark} // Pass delete atom setter
          onClose={handleCloseOptions} // Pass the closer handler
        />
      )}
    </div>
  );
};
