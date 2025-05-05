import { ArrowDownIcon, ArrowRightIcon, GripVertical } from "lucide-react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "@/application/atoms/todoListAtom";
import { SortableTaskItem } from "./TaskItem";
import { EmptyDropArea } from "./EmptyDropArea";

type CategorySectionProps = {
  title: string;
  tasks: TaskItem[];
  category: string;
  bgColor: string;
  isExpanded: boolean;
  onToggle: (category: string) => void;
  onRemoveTask: (id: string) => void;
  onMoveTask: (id: string, category: TaskItem["category"]) => void;
  onEditTask: (id: string, content: string) => void;
};

export const SortableCategorySection = ({
  title,
  tasks,
  category,
  bgColor,
  isExpanded,
  onToggle,
  onRemoveTask,
  onMoveTask,
  onEditTask,
}: CategorySectionProps) => {
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
          onClick={() => onToggle(category)}
        >
          {title}{" "}
          <span className="ml-2 bg-amber-50 text-accent rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {tasks.length}
          </span>
        </h3>
        <span onClick={() => onToggle(category)} className="cursor-pointer">
          {isExpanded ? (
            <ArrowDownIcon className="size-4" />
          ) : (
            <ArrowRightIcon className="size-4" />
          )}
        </span>
      </div>

      {isExpanded && (
        <div className="bg-gray-50">
          {tasks.length > 0 ? (
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onRemove={onRemoveTask}
                    onMove={onMoveTask}
                    onEdit={onEditTask}
                  />
                ))}
              </ul>
            </SortableContext>
          ) : (
            <EmptyDropArea categoryId={category} />
          )}
        </div>
      )}
    </div>
  );
};
