import { Size } from "@/application/types/window";
import React from "react";
import type { SetAtom } from "jotai"; // Import SetAtom type
import { Timer } from "@/app/(timer)/Timer";
import { BackgroundChanger } from "@/app/(settings)/(background)/background";
import { MusicPlayer } from "@/app/(music-player)/MusicPlayer";
import TodoList from "@/app/(to-do-list)/todoList";
import { AmbiencePlayer } from "@/app/(ambience)/ambiencePlayer";
import Notepad from "@/app/(notepad)/Notepad";

// Import timer lifecycle handlers
import {
  handleTimerOpen,
  handleTimerClose,
  handleTimerMinimize,
} from "@/application/atoms/timerAtom";

// Import ambience lifecycle handlers from hooks
import { ambienceLifecycle } from "@/app/(ambience)/ambienceLifecycle";

// Simplified Jotai Set type for callbacks
type JotaiSet = Parameters<Parameters<typeof SetAtom>[1]>[1];

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // Optional lifecycle callbacks
  onOpen?: (set: JotaiSet, windowId: string) => void;
  onClose?: (set: JotaiSet, windowId: string) => void;
  onMinimize?: (set: JotaiSet, windowId: string, isMinimized: boolean) => void;
}

export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'pomodoro'), and name for display

  timer: {
    name: "Timer",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 250, height: 300 },
    component: Timer,
    // Register timer lifecycle handlers
    onOpen: handleTimerOpen,
    onClose: handleTimerClose,
    onMinimize: handleTimerMinimize,
  },

  todoList: {
    name: "To-Do List",
    src: "/icons/board.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: TodoList,
  },

  ambience: {
    name: "Ambience",
    src: "/icons/ambience.png",
    defaultSize: { width: 375, height: 190 },
    minSize: { width: 375, height: 190 },
    component: AmbiencePlayer,
    // Register ambience lifecycle handlers
    onClose: ambienceLifecycle.handleClose,
    onMinimize: ambienceLifecycle.handleMinimize,
  },
  musicPlayer: {
    name: "Music Player",
    src: "/icons/music.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: MusicPlayer,
  },
  notepad: {
    name: "Notepad",
    src: "/icons/notepad.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: Notepad,
  },
  settings: {
    name: "Settings",
    src: "/icons/settings.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 250, height: 300 },
    component: BackgroundChanger,
  },
};

// Add other apps here using a unique key (appId);
