import React, { useState } from "react";

const TodoList = () => {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 flex flex-col h-full bg-gray-100">
      <div className="flex mb-4 border">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="flex-grow bg-white p-2 border rounded-l "
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="bg-secondary text-white px-4 py-2 rounded-r hover:bg-primary "
        >
          +
        </button>
      </div>
      <ul className="flex-grow overflow-y-auto space-y-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-white p-2 rounded shadow"
          >
            <span>{task}</span>
            <button
              onClick={() => handleRemoveTask(index)}
              className="text-red-500 hover:text-red-700 text-xs font-bold"
            >
              ✕
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center italic">No tasks yet!</p>
        )}
      </ul>
    </div>
  );
};

export default TodoList;
