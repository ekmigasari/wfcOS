import { useState } from "react";
import { useAtom } from "jotai";
import { tasksAtom, TaskItem } from "@/application/atoms/todoListAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useTodoList() {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [newTask, setNewTask] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState({
    todo: true,
    inProgress: true,
    done: true,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([
    "todo",
    "inProgress",
    "done",
  ]);

  // Get tasks for a category
  const getTasksByCategory = (category: string) => {
    return tasks.filter((task) => task.category === category);
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      playSound("/sounds/click.mp3");
      setTasks((currentTasks) => [
        ...currentTasks,
        {
          id: crypto.randomUUID(),
          content: newTask.trim(),
          category: "todo" as const,
        },
      ]);
      setNewTask("");
    }
  };

  const handleRemoveTask = (taskId: string) => {
    playSound("/sounds/click.mp3");
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  };

  const handleMoveTask = (
    taskId: string,
    newCategory: TaskItem["category"]
  ) => {
    playSound("/sounds/click.mp3");
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, category: newCategory } : task
      )
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev],
    }));
    playSound("/sounds/click.mp3");
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Check if we're dragging a category
    if (activeId.startsWith("category-") && overId.startsWith("category-")) {
      const oldIndex = categoryOrder.findIndex(
        (id) => `category-${id}` === activeId
      );
      const newIndex = categoryOrder.findIndex(
        (id) => `category-${id}` === overId
      );

      setCategoryOrder(arrayMove(categoryOrder, oldIndex, newIndex));
      playSound("/sounds/click.mp3");
      return;
    }

    // Check if we're dropping a task into an empty category
    if (
      !activeId.startsWith("category-") &&
      overId.startsWith("empty-category-")
    ) {
      const targetCategory = overId.replace(
        "empty-category-",
        ""
      ) as TaskItem["category"];

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === activeId ? { ...task, category: targetCategory } : task
        )
      );

      playSound("/sounds/click.mp3");
      setActiveId(null);
      return;
    }

    // Handle task reordering within the same category or moving between categories
    setTasks((currentTasks) => {
      const activeTask = currentTasks.find((task) => task.id === activeId);
      const overTask = currentTasks.find((task) => task.id === overId);

      if (!activeTask || !overTask) return currentTasks;

      // If same category, just reorder
      if (activeTask.category === overTask.category) {
        const category = activeTask.category;
        const categoryTasks = currentTasks.filter(
          (task) => task.category === category
        );

        const oldIndex = categoryTasks.findIndex(
          (task) => task.id === activeId
        );
        const newIndex = categoryTasks.findIndex((task) => task.id === overId);

        const reorderedCategoryTasks = arrayMove(
          categoryTasks,
          oldIndex,
          newIndex
        );

        // Create a new array where tasks in this category are replaced with reordered ones
        // and tasks from other categories remain unchanged
        const updatedTasks = currentTasks.filter(
          (task) => task.category !== category
        );
        return [...updatedTasks, ...reorderedCategoryTasks];
      }
      // If different category, move the task to the new category
      else {
        return currentTasks.map((task) =>
          task.id === activeId ? { ...task, category: overTask.category } : task
        );
      }
    });

    playSound("/sounds/click.mp3");
    setActiveId(null);
  };

  // Get active task
  const getActiveTask = () => {
    if (!activeId) return null;
    return tasks.find((task) => task.id === activeId);
  };

  return {
    tasks,
    newTask,
    setNewTask,
    expandedCategories,
    activeId,
    categoryOrder,
    handleAddTask,
    handleRemoveTask,
    handleMoveTask,
    toggleCategory,
    handleDragStart,
    handleDragEnd,
    getTasksByCategory,
    getActiveTask,
  };
}
