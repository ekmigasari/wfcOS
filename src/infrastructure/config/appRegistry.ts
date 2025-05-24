import React from "react";

import { AmbiencePlayer } from "@/app/(ambience)/ambiencePlayer";
import Bookmark from "@/app/(bookmark)/Bookmark";
import { MusicPlayer } from "@/app/(music-player)/MusicPlayer";
import Notepad from "@/app/(notepad)/Notepad";
import SessionLogApp from "@/app/(session-log)/SessionLogApp";
import { BackgroundChanger } from "@/app/(settings)/(background)/background";
import { SoundChanger } from "@/app/(settings)/(sound)/sound";
import { SettingsPanel } from "@/app/(settings)/SettingsPanel";
import { Timer } from "@/app/(timer)/Timer";
import TodoList from "@/app/(to-do-list)/todoList";
import { Size } from "@/application/types/window";
import { ChangelogWindow } from "@/presentation/components/shared/taskbar/ChangelogWindow";
import UserSettingsApp from "@/app/(user-settings)/UserSettingsApp";

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  hidden?: boolean; // Flag to hide app from desktop icons
}

// Settings module specific entries
export interface SettingsEntry {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  icon: string;
}

export const settingsRegistry: SettingsEntry[] = [
  {
    id: "background",
    name: "Background",
    component: BackgroundChanger,
    icon: "/icons/wallpaper.png",
  },
  {
    id: "sound",
    name: "Sound",
    component: SoundChanger,
    icon: "/icons/volume.png",
  },
];

export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'pomodoro'), and name for display

  timer: {
    name: "Timer",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 400, height: 350 },
    component: Timer,
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
    defaultSize: { width: 600, height: 600 },
    minSize: { width: 320, height: 400 },
    component: Notepad,
  },
  bookmark: {
    name: "Bookmark",
    src: "/icons/bookmark.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: Bookmark,
  },
  settings: {
    name: "Settings",
    src: "/icons/settings.png",
    defaultSize: { width: 500, height: 550 },
    minSize: { width: 300, height: 300 },
    component: SettingsPanel,
  },

  changelog: {
    name: "Changelog",
    src: "/icons/default.png",
    defaultSize: { width: 500, height: 400 },
    minSize: { width: 300, height: 200 },
    component: ChangelogWindow,
    hidden: true, // Hide from desktop icons
  },
  sessionLog: {
    name: "Session Log",
    src: "/icons/default.png",
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 450, height: 300 },
    component: SessionLogApp,
    hidden: true,
  },
  usersettings: {
    name: "User Settings",
    src: "/icons/default.png",
    defaultSize: { width: 700, height: 650 },
    minSize: { width: 500, height: 400 },
    component: UserSettingsApp,
    hidden: true,
  },
};

// Add other apps here using a unique key (appId);
