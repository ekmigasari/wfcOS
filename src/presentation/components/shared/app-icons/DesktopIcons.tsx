"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { AppIcon } from "./AppIcon";
import { Window } from "../../shared/window/Window";
import { playSound } from "@/infrastructure/lib/utils";
import {
  openWindowsAtom,
  openWindowAtom,
  closeWindowAtom,
} from "@/application/atoms/windowAtoms";

export const DesktopIcons = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Window state management
  const [openWindows] = useAtom(openWindowsAtom);
  const openWindow = useAtom(openWindowAtom)[1];
  const closeWindow = useAtom(closeWindowAtom)[1];

  // Convert appRegistry to an array for mapping (if it's an object)
  const apps = Object.entries(appRegistry).map(([id, config]) => ({
    id, // This is the appId
    ...config,
  }));

  const handleOpenApp = (appId: string) => {
    const appConfig = appRegistry[appId];
    if (!appConfig) return;

    playSound("/sounds/open.mp3");

    const windowInstanceId = `${appId}-instance`;

    openWindow({
      id: windowInstanceId,
      appId: appId,
      title: appConfig.name,
      minSize: appConfig.minSize,
      initialSize: appConfig.defaultSize,
    });

    setSelectedAppId(appId);
  };

  const handleCloseWindow = (windowId: string) => {
    playSound("/sounds/close.mp3");
    closeWindow(windowId);
  };

  return (
    <>
      {/* Background click to clear selection */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setSelectedAppId(null)}
      ></div>

      {/* Desktop Icons */}
      <div className="absolute top-4 right-4 flex flex-col flex-wrap-reverse gap-2 z-10 max-h-[calc(100vh-80px)]">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`p-1 rounded ${
              selectedAppId === app.id ? "brightness-75" : ""
            }`}
          >
            <AppIcon
              src={app.src}
              name={app.name}
              appId={app.id}
              onOpenApp={handleOpenApp}
            />
          </div>
        ))}
      </div>

      {/* Render Windows */}
      {openWindows.map((window) => {
        const appConfig = appRegistry[window.appId];
        if (!appConfig) return null;

        return (
          <Window
            key={window.id}
            windowId={window.id}
            title={window.title}
            isOpen={true}
            onClose={() => handleCloseWindow(window.id)}
            initialSize={window.size}
            initialPosition={window.position}
            minSize={window.minSize}
            zIndex={window.zIndex}
          >
            {/* Show placeholder content until actual component is available */}
            <div className="flex items-center justify-center h-full bg-slate-800 text-white p-4">
              <p>Content for {window.title} will be displayed here</p>
            </div>
          </Window>
        );
      })}
    </>
  );
};
