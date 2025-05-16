"use client";

import { useAtom } from "jotai";

import { openWindowAtom } from "@/application/atoms/windowAtoms";
import { appRegistry } from "@/infrastructure/config/appRegistry";

export const USERSETTINGS_WINDOW_ID = "usersettingsid";

// Custom hook for opening the changelog window
export const useOpenUserSettings = () => {
  const openWindow = useAtom(openWindowAtom)[1];

  const openUserSettings = () => {
    const appConfig = appRegistry["usersettings"];
    if (!appConfig) {
      console.error("User settings app configuration not found in appRegistry");
      return;
    }

    openWindow({
      id: USERSETTINGS_WINDOW_ID,
      appId: "usersettings",
      title: appConfig.name,
      initialSize: appConfig.defaultSize,
      minSize: appConfig.minSize,
    });
  };

  return openUserSettings;
};
