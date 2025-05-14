import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Timer,Trash2 } from "lucide-react";
import { useEffect,useRef, useState } from "react";

import { TaskItem } from "@/application/atoms/todoListAtom";
import { playSound } from "@/infrastructure/lib/utils";

interface TaskItemProps {
  task: TaskItem;
  sessionCount: number;
  onRemove: (id: string) => void;
  onMove: (id: string, category: TaskItem["category"]) => void;
  onEdit: (id: string, content: string) => void;
}

export const SortableTaskItem = ({
  task,
  sessionCount,
  onRemove,
  onMove,
  onEdit,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [showOptions, setShowOptions] = useState(false);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    playSound("/sounds/click.mp3");
    if (isEditing) {
      onEdit(task.id, editedContent);
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedContent(task.content);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      optionsButtonRef.current &&
      !optionsButtonRef.current.contains(e.target as Node)
    ) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

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
          {isEditing ? (
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEdit}
              className="text-sm flex-grow border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span className="text-sm break-words flex-grow">
              {task.content}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center justify-start ml-1 ">
            {sessionCount > 0 && (
              <div className="text-xs text-gray-500 flex items-center truncate">
                <Timer className="size-3 text-gray-400 mr-1" />
                {sessionCount} sessions
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-1">
            <select
              value={task.category}
              onChange={(e) =>
                onMove(task.id, e.target.value as TaskItem["category"])
              }
              className="text-xs bg-transparent border rounded"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={handleEdit}>
              <div className="relative hover:bg-blue-200 p-1 rounded">
                <Pencil className="size-4" />
              </div>
            </button>
            <button onClick={() => onRemove(task.id)}>
              <div className="relative hover:bg-red-200 p-1 rounded">
                <Trash2 className="size-4 text-red-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export const TaskItemForOverlay = ({ task }: { task: TaskItem }) => (
  <div className="bg-white p-3 my-1 rounded shadow-md border-2 border-secondary w-full max-w-[300px]">
    <div className="flex flex-col justify-center items-start relative w-full">
      <div className="flex w-full items-center">
        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-sm break-words flex-grow">{task.content}</span>
      </div>
    </div>
  </div>
);
