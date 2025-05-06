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
import { Button } from "@/presentation/components/ui/button";
import { playSound } from "@/infrastructure/lib/utils";

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
    <div className="flex flex-col h-full p-4 bg-stone-50">
      <div className="flex items-center justify-center mb-6">
        {isAddingBookmark || editingBookmark ? (
          <Button
            className="bg-secondary hover:bg-accent"
            onClick={() => {
              playSound("/sounds/click.mp3");
              setIsAddingBookmark(false);
              setEditingBookmark(null);
            }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            className="bg-secondary hover:bg-accent"
            onClick={() => {
              playSound("/sounds/click.mp3");
              setIsAddingBookmark(true);
            }}
          >
            Add Bookmark
          </Button>
        )}
      </div>

      {isAddingBookmark && (
        <BookmarkForm
          onAddComplete={() => {
            playSound("/sounds/click.mp3");
            setIsAddingBookmark(false);
          }}
        />
      )}

      {editingBookmark && (
        <BookmarkForm
          initialValues={editingBookmark}
          onAddComplete={() => {
            playSound("/sounds/click.mp3");
            setEditingBookmark(null);
          }}
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
            <BookmarkList
              onEdit={(bookmark) => {
                playSound("/sounds/click.mp3");
                setEditingBookmark(bookmark);
              }}
            />
          </SortableContext>
        </DndContext>
      </div>

      {bookmarks.length === 0 && !isAddingBookmark && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p>No bookmarks yet.</p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            onClick={() => {
              playSound("/sounds/click.mp3");
              setIsAddingBookmark(true);
            }}
          >
            Add your first bookmark
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookmark;
