"use client";

import React from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  minimizedWindowsAtom,
  restoreWindowAtom,
} from "@/application/atoms/windowAtoms";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "../../ui/button";

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
    <div className="minimized-icons flex gap-1">
      {minimizedWindows.map((window) => {
        // Get app info from registry for the icon
        const appInfo = appRegistry[window.appId];

        return (
          <Button
            key={window.id}
            onClick={() => handleRestoreWindow(window.id)}
            title={window.title}
            variant="ghost"
            size="icon"
            className="size-7"
          >
            {appInfo?.src ? (
              <Image
                src={appInfo.src}
                alt={window.title}
                width={20}
                height={20}
              />
            ) : (
              <div className="w-6 h-6 bg-secondary/50 rounded-sm flex items-center justify-center text-xs text-white">
                {window.title.charAt(0)}
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};
