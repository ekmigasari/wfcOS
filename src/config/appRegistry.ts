import { Size } from "../types";
import PodomoroTimer from "../components/apps/podomoro";
import TodoList from "../components/apps/todoList";
import React from "react";

interface AppRegistryEntry {
  defaultSize: Size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // Add other app-specific metadata here if needed in the future
}

// Define default sizes and components for different applications
export const appRegistry: Record<string, AppRegistryEntry> = {
  Podomoro: {
    defaultSize: { width: 350, height: 400 },
    component: PodomoroTimer,
  },
  Music: {
    defaultSize: { width: 500, height: 300 },
    component: () =>
      React.createElement("div", null, "Music Player Coming Soon"),
  },
  Photobox: {
    defaultSize: { width: 400, height: 450 },
    component: () => React.createElement("div", null, "Photobox Coming Soon"),
  },
  "Cafe list": {
    defaultSize: { width: 450, height: 500 },
    component: () => React.createElement("div", null, "Cafe List Coming Soon"),
  },
  "To-do list": {
    defaultSize: { width: 300, height: 400 },
    component: TodoList,
  },
  "Chat room": {
    defaultSize: { width: 380, height: 550 },
    component: () => React.createElement("div", null, "Chat Room Coming Soon"),
  },
  // Add other apps here
};
