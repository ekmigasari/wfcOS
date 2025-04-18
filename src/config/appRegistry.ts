import { Size } from "../types";
import PodomoroTimer from "../components/apps/podomoro";
import TodoList from "../components/apps/todoList";
import BackgroundChanger from "../components/apps/background";
import React from "react";
import TextEditor from "../components/apps/textEditor";
import MusicPlayer from "../components/apps/musicPlayer";
import AmbiencePlayer from "../components/apps/ambiencePlayer";

// Updated interface to include missing fields
interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size; // Optional minimum size for the window
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // Add other app-specific metadata here if needed in the future
}

// Define default sizes and components for different applications
// Added name, src, and optional minSize
export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'podomoro'), and name for display
  podomoro: {
    name: "Podomoro",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 650 },
    minSize: { width: 250, height: 300 }, // Example minSize
    component: PodomoroTimer,
  },
  music: {
    name: "Music",
    src: "/icons/music.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 350, height: 250 },
    component: MusicPlayer,
  },
  ambience: {
    name: "Ambience",
    src: "/icons/ambience.png",
    defaultSize: { width: 375, height: 190 },
    minSize: { width: 375, height: 190 },
    component: AmbiencePlayer,
  },
  photobox: {
    name: "Photobox",
    src: "/icons/camera.png",
    defaultSize: { width: 400, height: 450 },
    component: () => React.createElement("div", null, "Photobox Coming Soon"),
  },
  cafeList: {
    name: "Cafe list",
    src: "/icons/cafe.png",
    defaultSize: { width: 450, height: 500 },
    component: () => React.createElement("div", null, "Cafe List Coming Soon"),
  },
  todoList: {
    name: "To-do list",
    src: "/icons/board.png",
    defaultSize: { width: 400, height: 400 },
    minSize: { width: 300, height: 340 },
    component: TodoList,
  },
  chatRoom: {
    name: "Chat room",
    src: "/icons/phone.png",
    defaultSize: { width: 380, height: 550 },
    component: () => React.createElement("div", null, "Chat Room Coming Soon"),
  },

  textEditor: {
    name: "Notepad",
    src: "/icons/notepad.png",
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 300, height: 320 },
    component: TextEditor,
  },
  background: {
    name: "Settings",
    src: "/icons/settings.png",
    defaultSize: { width: 600, height: 450 },
    minSize: { width: 470, height: 340 },
    component: BackgroundChanger,
  },
  // Add other apps here using a unique key (appId)
};
