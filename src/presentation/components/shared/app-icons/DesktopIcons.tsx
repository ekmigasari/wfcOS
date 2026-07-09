"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { openWindowAtom } from "@/application/atoms/windowAtoms";
import { useOnlineStatus } from "@/application/hooks";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";
import { openExternalUrl } from "@/infrastructure/utils/externalNavigation";
import { AppIcon } from "./AppIcon";

export const DesktopIcons = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const { isOnline } = useOnlineStatus();

  // Window state management
  const openWindow = useAtom(openWindowAtom)[1];

  // Convert appRegistry to an array for mapping (if it's an object)
  // Filter out apps with hidden flag
  const apps = Object.entries(appRegistry)
    .filter(([, config]) => !config.hidden)
    .map(([id, config]) => ({
      id, // This is the appId
      ...config,
    }));

  const handleOpenApp = (appId: string) => {
    const appConfig = appRegistry[appId];
    if (!appConfig) return;

    if (appConfig.externalUrl) {
      playSound("/sounds/click.mp3");
      openExternalUrl(appConfig.externalUrl, appConfig.offlineMessage);
      setSelectedAppId(appId);
      return;
    }

    if (appConfig.onlineOnly && !isOnline) {
      playSound("/sounds/click.mp3");
      window.alert(
        appConfig.offlineMessage ||
          "This feature needs an internet connection and is not available offline yet."
      );
      setSelectedAppId(appId);
      return;
    }

    const windowInstanceId = `${appId}-instance`;

    playSound("/sounds/open.mp3");
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
