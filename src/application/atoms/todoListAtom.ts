import { atom } from "jotai";

import {
  loadFeatureState,
  saveFeatureState,
} from "../../infrastructure/utils/storage";

const FEATURE_KEY = "todoList";

// Define task item type
export interface TaskItem {
  id: string;
  content: string;
  category: "todo" | "inProgress" | "done";
}

// Define the shape of the state
export type TodoListState = TaskItem[];

// Load initial state from localStorage or use default (empty array)
const initialTasks = loadFeatureState<TodoListState>(FEATURE_KEY) ?? [];

// Create the base atom
const baseTasksAtom = atom<TodoListState>(initialTasks);

// Create a derived atom that saves to localStorage on change
export const tasksAtom = atom(
  (get) => get(baseTasksAtom),
  (
    get,
    set,
    newTasks: TodoListState | ((prevTasks: TodoListState) => TodoListState)
  ) => {
    const updatedTasks =
      typeof newTasks === "function" ? newTasks(get(baseTasksAtom)) : newTasks;
    set(baseTasksAtom, updatedTasks);
    saveFeatureState(FEATURE_KEY, updatedTasks);
  }
);

export const editTaskAtom = atom(
  null,
  (get, set, { id, content }: { id: string; content: string }) => {
    const currentTasks = get(tasksAtom);
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, content } : task
    );
    set(tasksAtom, updatedTasks);
  }
);

// Derived atom for incomplete tasks (useful for the timer's task selector)
export const incompleteTasksAtom = atom((get) =>
  get(tasksAtom).filter((task) => task.category !== "done")
);

// Optional: Add derived atoms for specific actions if needed (often done in component)
// export const addTaskAtom = atom(null, (get, set, newTask: string) => { ... });
// export const removeTaskAtom = atom(null, (get, set, taskIndex: number) => { ... });
