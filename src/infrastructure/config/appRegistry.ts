import { Size } from "@/application/types/window";
import React from "react";
import { Timer } from "@/app/(timer)/Timer";
import { BackgroundChanger } from "@/app/(settings)/(background)/background";

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'pomodoro'), and name for display

  timer: {
    name: "Timer",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 250, height: 300 },
    component: Timer,
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
