import { Size } from "@/application/types/window";
import React from "react";
import { Timer } from "@/app/(timer)/Timer";
import { BackgroundChanger } from "@/app/(settings)/(background)/background";
import { SoundChanger } from "@/app/(settings)/(sound)/sound";
import { MusicPlayer } from "@/app/(music-player)/MusicPlayer";
import TodoList from "@/app/(to-do-list)/todoList";
import { AmbiencePlayer } from "@/app/(ambience)/ambiencePlayer";
import Notepad from "@/app/(notepad)/Notepad";
import { ChangelogWindow } from "@/presentation/components/shared/taskbar/ChangelogWindow";
import Bookmark from "@/app/(bookmark)/Bookmark";
import { SettingsPanel } from "@/app/(settings)/SettingsPanel";
import SessionLogApp from "@/app/(session-log)/SessionLogApp";
// import { StorageMigrationApp } from "@/app/(migration)/StorageMigrationApp";

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  component: React.ComponentType<any>;
  externalUrl?: string;
  hidden?: boolean; // Flag to hide app from desktop icons
  onlineOnly?: boolean;
  offlineMessage?: string;
}

// Settings module specific entries
export interface SettingsEntry {
  id: string;
  name: string;
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
    onlineOnly: true,
    offlineMessage:
      "Music streaming needs an internet connection. Your playlist stays saved locally.",
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
    src: "/icons/bookmark.png", // We'll need to ensure this icon exists
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
  // migrateData: {
  //   name: "Migrate Data",
  //   src: "/icons/news.png",
  //   defaultSize: { width: 460, height: 360 },
  //   minSize: { width: 360, height: 360 },
  //   component: StorageMigrationApp,
  //   onlineOnly: true,
  //   offlineMessage:
  //     "Data migration needs internet because it sends your local data to the new website.",
  // },
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
  findCoffeeShop: {
    name: "Find Coffee Shop",
    src: "/icons/cafe.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: SessionLogApp,
    externalUrl: "https://beta.workfromcoffee.com/",
  },
  community: {
    name: "Community",
    src: "/icons/doughnut.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: SessionLogApp,
    externalUrl: "https://discord.gg/yPQ62P5BBr",
  },
  giveTips: {
    name: "Buy Us a Coffee",
    src: "/icons/tips.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: SessionLogApp,
    externalUrl: "https://workfromcoffee.gumroad.com/coffee",
  },
};

// Add other apps here using a unique key (appId);
