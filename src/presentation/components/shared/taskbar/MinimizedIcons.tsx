"use client";

import React from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  minimizedWindowsAtom,
  restoreWindowAtom,
} from "@/application/atoms/windowAtoms";
import { appRegistry } from "@/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";
import { cn } from "@/infrastructure/lib/utils";

export const MinimizedIcons = () => {
  // Get minimized windows from state
  const [minimizedWindows] = useAtom(minimizedWindowsAtom);
  const restoreWindow = useAtom(restoreWindowAtom)[1];

  // Restore a window when clicked in taskbar
  const handleRestoreWindow = (windowId: string) => {
    playSound("/sounds/click.mp3");
    restoreWindow(windowId);
  };

  // Don't render if no minimized windows
  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="minimized-icons flex gap-2">
      {minimizedWindows.map((window) => {
        // Get app info from registry for the icon
        const appInfo = appRegistry[window.appId];

        return (
          <button
            key={window.id}
            className={cn(
              "taskbar-item relative flex items-center justify-center",
              "w-10 h-10 rounded p-1 transition-all",
              "hover:bg-secondary/30 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            )}
            onClick={() => handleRestoreWindow(window.id)}
            title={window.title}
          >
            {appInfo?.src ? (
              <Image
                src={appInfo.src}
                alt={window.title}
                width={24}
                height={24}
                className="w-6 h-6"
              />
            ) : (
              <div className="w-6 h-6 bg-secondary/50 rounded-sm flex items-center justify-center text-xs text-white">
                {window.title.charAt(0)}
              </div>
            )}

            {/* Active indicator dot */}
            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
          </button>
        );
      })}
    </div>
  );
};
