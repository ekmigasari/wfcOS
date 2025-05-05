"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { BookmarkList } from "./components/BookmarkList";
import { BookmarkForm } from "./components/BookmarkForm";
import { bookmarksAtom } from "@/application/atoms/bookmarkAtom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { reorderBookmarksAtom } from "@/application/atoms/bookmarkAtom";

export const Bookmark = () => {
  const [bookmarks] = useAtom(bookmarksAtom);
  const [, reorderBookmarks] = useAtom(reorderBookmarksAtom);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = bookmarks.findIndex((item) => item.id === active.id);
      const newIndex = bookmarks.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBookmarks({ oldIndex, newIndex });
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Bookmarks</h1>
        {isAddingBookmark || editingBookmark ? (
          <button
            className="px-3 py-1 text-sm bg-secondary/20 hover:bg-secondary/30 rounded-md transition-colors"
            onClick={() => {
              setIsAddingBookmark(false);
              setEditingBookmark(null);
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            className="px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            onClick={() => setIsAddingBookmark(true)}
          >
            Add Bookmark
          </button>
        )}
      </header>

      {isAddingBookmark && (
        <BookmarkForm onAddComplete={() => setIsAddingBookmark(false)} />
      )}

      {editingBookmark && (
        <BookmarkForm
          initialValues={editingBookmark}
          onAddComplete={() => setEditingBookmark(null)}
        />
      )}

      <div className="mt-2 flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={bookmarks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <BookmarkList onEdit={(bookmark) => setEditingBookmark(bookmark)} />
          </SortableContext>
        </DndContext>
      </div>

      {bookmarks.length === 0 && !isAddingBookmark && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p>No bookmarks yet.</p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            onClick={() => setIsAddingBookmark(true)}
          >
            Add your first bookmark
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookmark;
