import {
  closestCenter,
  DndContext,
  DragOverlay,
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
import { useAtom } from "jotai";
import React from "react";

import { editTaskAtom } from "../../application/atoms/todoListAtom";
import { useTodoList } from "../../application/hooks/useTodoList";
import { SortableCategorySection } from "./components/CategorySection";
import { TaskItemForOverlay } from "./components/TaskItem";

const TodoList = () => {
  const {
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
  } = useTodoList();

  const [, editTask] = useAtom(editTaskAtom);

  const handleEditTask = (id: string, content: string) => {
    editTask({ id, content });
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
                  isExpanded={
                    expandedCategories[
                      categoryId as keyof typeof expandedCategories
                    ]
                  }
                  onToggle={toggleCategory}
                  onRemoveTask={handleRemoveTask}
                  onMoveTask={handleMoveTask}
                  onEditTask={handleEditTask}
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
