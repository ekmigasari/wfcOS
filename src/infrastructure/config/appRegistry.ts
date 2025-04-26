import { Size } from "@/application/types/window";

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  //   component: React.ComponentType<any>;
}

export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'pomodoro'), and name for display
  podomoro: {
    name: "Pomodoro",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 650 },
    minSize: { width: 250, height: 300 }, // Example minSize
    // component: PodomoroTimer,
  },
  music: {
    name: "Music",
    src: "/icons/music.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 350, height: 250 },
    // component: MusicPlayer,
  },

  todoList: {
    name: "To-do list",
    src: "/icons/board.png",
    defaultSize: { width: 400, height: 400 },
    minSize: { width: 300, height: 340 },
    // component: TodoList,
  },

  notepad: {
    name: "Notepad",
    src: "/icons/notepad.png",
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 300, height: 320 },
    // component: TextEditor,
  },
  ambience: {
    name: "Ambience",
    src: "/icons/ambience.png",
    defaultSize: { width: 375, height: 190 },
    minSize: { width: 375, height: 190 },
    // component: AmbiencePlayer,
  },
  background: {
    name: "Settings",
    src: "/icons/settings.png",
    defaultSize: { width: 600, height: 450 },
    minSize: { width: 470, height: 340 },
    // component: BackgroundChanger,
  },
  // Add other apps here using a unique key (appId)
};
