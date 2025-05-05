"use client";

import { useAtom } from "jotai";
import {
  BookmarkItem,
  bookmarksAtom,
  deleteBookmarkAtom,
} from "@/application/atoms/bookmarkAtom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, Edit, Trash2, GripVertical } from "lucide-react";

interface SortableBookmarkItemProps {
  bookmark: BookmarkItem;
  onEdit: (bookmark: BookmarkItem) => void;
}

const SortableBookmarkItem = ({
  bookmark,
  onEdit,
}: SortableBookmarkItemProps) => {
  const [, deleteBookmark] = useAtom(deleteBookmarkAtom);

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

      <div className="flex-1 min-w-0 mr-4">
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

      <div className="flex gap-1">
        <button
          onClick={handleOpenLink}
          title="Open link"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <ExternalLink size={16} />
        </button>

        <button
          onClick={() => onEdit(bookmark)}
          title="Edit"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Edit size={16} />
        </button>

        <button
          onClick={() => deleteBookmark(bookmark.id)}
          title="Delete"
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={16} />
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
