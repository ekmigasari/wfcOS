"use client";

import { useAtom } from "jotai";
import { useState, useEffect, useRef } from "react";
import {
  BookmarkItem,
  bookmarksAtom,
  deleteBookmarkAtom,
} from "@/application/atoms/bookmarkAtom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ExternalLink,
  Edit,
  Trash2,
  GripVertical,
  MoreVertical,
} from "lucide-react";

interface SortableBookmarkItemProps {
  bookmark: BookmarkItem;
  onEdit: (bookmark: BookmarkItem) => void;
}

const SortableBookmarkItem = ({
  bookmark,
  onEdit,
}: SortableBookmarkItemProps) => {
  const [, deleteBookmark] = useAtom(deleteBookmarkAtom);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
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
    window.open(bookmark.url, "_blank");
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showOptions &&
        optionsRef.current &&
        optionsButtonRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        !optionsButtonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 mb-2 bg-card rounded-md border border-border shadow-sm hover:shadow-md transition-shadow`}
    >
      <div
        className="cursor-grab mr-2 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </div>

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
      <div className="relative" style={{ zIndex: 50 }}>
        <button
          ref={optionsButtonRef}
          onClick={toggleOptions}
          title="More options"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        {showOptions && (
          <div
            ref={optionsRef}
            className="right-0 mt-1 w-32 bg-card rounded-md shadow-lg border border-border"
            style={{
              zIndex: 9999,
              position: "absolute",
              transform: "translateZ(0)",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
                setShowOptions(false);
              }}
              className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-accent/50 transition-colors rounded-t-md"
            >
              <Edit size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBookmark(bookmark.id);
                setShowOptions(false);
              }}
              className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-destructive/10 hover:text-destructive transition-colors rounded-b-md"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={handleOpenLink}
          title="Open link"
          className="p-1.5 rounded-md text-primary hover:text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

export interface BookmarkListProps {
  onEdit: (bookmark: BookmarkItem) => void;
}

export const BookmarkList = ({ onEdit }: BookmarkListProps) => {
  const [bookmarks] = useAtom(bookmarksAtom);

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {bookmarks.map((bookmark) => (
        <SortableBookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
