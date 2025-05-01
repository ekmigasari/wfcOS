"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  minimizedWindowsAtom,
  setWindowMinimizedStateAtom,
} from "@/application/atoms/windowAtoms";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "../../ui/button";

export const MinimizedIcons = () => {
  // Client-side only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Get minimized windows from state
  const [minimizedWindows] = useAtom(minimizedWindowsAtom);
  const setWindowMinimizedState = useAtom(setWindowMinimizedStateAtom)[1];

  // Use useEffect to mark component as mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore a window when clicked in taskbar - simply toggle isMinimized state
  const handleRestoreWindow = (windowId: string) => {
    // Optional sound effect
    playSound("/sounds/click.mp3");

    // Just update the minimized state boolean in the atom
    setWindowMinimizedState({ windowId, isMinimized: false });
  };

  // Don't render during SSR or if no minimized windows
  if (!mounted || minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="minimized-icons flex gap-1 overflow-auto">
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
