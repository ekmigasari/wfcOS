import React, { useState } from "react";
import { useAtom } from "jotai";
import { tasksAtom, TaskItem } from "../../application/atoms/todoListAtom";
import { playSound } from "@/infrastructure/lib/utils";
import {
  ArrowRightIcon,
  ArrowDownIcon,
  XCircle,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TodoList = () => {
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

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Component to render a sortable task item
  const SortableTaskItem = ({ task }: { task: TaskItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li ref={setNodeRef} style={style} className="bg-white p-3 my-1 rounded">
        <div className="flex flex-col justify-center items-start relative w-full">
          <div className="flex w-full items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab mr-2 touch-none"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-sm break-words flex-grow">
              {task.content}
            </span>
          </div>
          <div className="flex items-center justify-end w-full mt-2">
            <select
              value={task.category}
              onChange={(e) =>
                handleMoveTask(task.id, e.target.value as TaskItem["category"])
              }
              className="text-xs bg-gray-50 border rounded px-2 py-1"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={() => handleRemoveTask(task.id)} className="ml-2">
              <div className="relative">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </button>
          </div>
        </div>
      </li>
    );
  };

  // Component to render a task for overlay
  const TaskItemForOverlay = ({ task }: { task: TaskItem }) => (
    <div className="bg-white p-3 my-1 rounded shadow-md border-2 border-secondary w-full max-w-[300px]">
      <div className="flex flex-col justify-center items-start relative w-full">
        <div className="flex w-full items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm break-words flex-grow">{task.content}</span>
        </div>
      </div>
    </div>
  );

  // Component to render a sortable category section
  const SortableCategorySection = ({
    title,
    tasks,
    category,
    bgColor,
  }: {
    title: string;
    tasks: TaskItem[];
    category: string;
    bgColor: string;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: `category-${category}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div className="mb-4" ref={setNodeRef} style={style}>
        <div
          className={`${bgColor} px-3 py-2 rounded flex justify-between items-center`}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab mr-2 touch-none"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
          <h3
            className="font-semibold flex items-center text-primary flex-grow cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {title}{" "}
            <span className="ml-2 bg-amber-50 text-accent rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {tasks.length}
            </span>
          </h3>
          <span
            onClick={() => toggleCategory(category)}
            className="cursor-pointer"
          >
            {expandedCategories[category as keyof typeof expandedCategories] ? (
              <ArrowDownIcon className="size-4" />
            ) : (
              <ArrowRightIcon className="size-4" />
            )}
          </span>
        </div>

        {expandedCategories[category as keyof typeof expandedCategories] && (
          <div className="bg-gray-50">
            {tasks.length > 0 ? (
              <SortableContext
                items={tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {tasks.map((task) => (
                    <SortableTaskItem key={task.id} task={task} />
                  ))}
                </ul>
              </SortableContext>
            ) : (
              <DroppableEmptyArea categoryId={category} />
            )}
          </div>
        )}
      </div>
    );
  };

  // Droppable area for empty categories
  const DroppableEmptyArea = ({ categoryId }: { categoryId: string }) => {
    const { setNodeRef } = useSortable({
      id: `empty-category-${categoryId}`,
      data: {
        type: "empty-category",
        categoryId,
      },
    });

    return (
      <div
        ref={setNodeRef}
        className="text-gray-400 text-center italic text-sm py-6 border border-dashed border-gray-300 my-2 mx-2 rounded bg-gray-50"
      >
        Drop tasks here
      </div>
    );
  };

  // Get active task
  const getActiveTask = () => {
    if (!activeId) return null;
    return tasks.find((task) => task.id === activeId);
  };

  return (
    <div className="p-4 flex flex-col h-full bg-stone-50">
      {/* Input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="flex-grow bg-white p-2 border border-gray-300 rounded-l min-w-0"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="bg-secondary text-white px-4 py-2 rounded-r hover:bg-accent "
        >
          +
        </button>
      </div>

      {/* Categories */}
      <div className="flex-grow overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryOrder.map((id) => `category-${id}`)}
            strategy={verticalListSortingStrategy}
          >
            {categoryOrder.map((categoryId) => {
              const categoryTasks = getTasksByCategory(categoryId);
              let title = "";
              const bgColor = "bg-stone-200";

              switch (categoryId) {
                case "todo":
                  title = "To Do";
                  break;
                case "inProgress":
                  title = "In Progress";
                  break;
                case "done":
                  title = "Done";
                  break;
              }

              return (
                <SortableCategorySection
                  key={categoryId}
                  title={title}
                  tasks={categoryTasks}
                  category={categoryId}
                  bgColor={bgColor}
                />
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeId && getActiveTask() ? (
              <TaskItemForOverlay task={getActiveTask()!} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default TodoList;
