import React, { useState } from "react";
import { useAtom } from "jotai";
import { tasksAtom, TaskItem } from "../../atoms/todoListAtom"; // Adjust path as needed
import { playSound } from "@/infrastructure/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { ArrowDownIcon } from "lucide-react";
import { XCircle } from "lucide-react";
const TodoList = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [newTask, setNewTask] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState({
    todo: true,
    inProgress: true,
    done: true,
  });

  // Filter tasks by category
  const todoTasks = tasks.filter((task) => task.category === "todo");
  const inProgressTasks = tasks.filter(
    (task) => task.category === "inProgress"
  );
  const doneTasks = tasks.filter((task) => task.category === "done");

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

  // Component to render a task item
  const TaskItem = ({ task }: { task: TaskItem }) => (
    <li className="bg-white p-3 my-1 rounded ">
      <div className="flex flex-col justify-center items-start relative w-full">
        <span className="text-sm mr-2 break-words w-full">{task.content}</span>
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

  // Component to render a category section
  const CategorySection = ({
    title,
    tasks,
    category,
  }: {
    title: string;
    tasks: TaskItem[];
    bgColor: string;
    category: string;
  }) => (
    <div className="mb-4">
      <div
        className={`bg-stone-200 px-3 py-2 rounded flex justify-between items-center cursor-pointer`}
        onClick={() => toggleCategory(category)}
      >
        <h3 className="font-semibold flex items-center text-primary">
          {title}{" "}
          <span className="ml-2 bg-amber-50 text-accent rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {tasks.length}
          </span>
        </h3>
        <span>
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
            <ul>
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center italic text-sm py-2">
              No tasks
            </p>
          )}
        </div>
      )}
    </div>
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
        <CategorySection
          title="To Do"
          tasks={todoTasks}
          bgColor="bg-gray-200"
          category="todo"
        />

        <CategorySection
          title="In Progress"
          tasks={inProgressTasks}
          bgColor="bg-gray-200"
          category="inProgress"
        />

        <CategorySection
          title="Done"
          tasks={doneTasks}
          bgColor="bg-gray-200"
          category="done"
        />
      </div>
    </div>
  );
};

export default TodoList;
