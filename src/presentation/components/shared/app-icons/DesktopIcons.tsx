"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { AppIcon } from "./AppIcon";
import { playSound } from "@/infrastructure/lib/utils";
import { openWindowAtom } from "@/application/atoms/windowAtoms";

export const DesktopIcons = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Window state management
  const openWindow = useAtom(openWindowAtom)[1];

  // Convert appRegistry to an array for mapping (if it's an object)
  const apps = Object.entries(appRegistry).map(([id, config]) => ({
    id, // This is the appId
    ...config,
  }));

  const handleOpenApp = (appId: string) => {
    const appConfig = appRegistry[appId];
    if (!appConfig) return;

    const windowInstanceId = `${appId}-instance`;

    playSound("/sounds/open.mp3");

    // Call openWindow atom - it handles existing/new/minimized logic internally
    openWindow({
      id: windowInstanceId,
      appId: appId,
      title: appConfig.name,
      minSize: appConfig.minSize,
      initialSize: appConfig.defaultSize,
      // initialPosition is handled by the atom if not provided
    });

    setSelectedAppId(appId); // Select the icon
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
              onSelect={setSelectedAppId}
            />
          </div>
        ))}
      </div>
    </>
  );
};
