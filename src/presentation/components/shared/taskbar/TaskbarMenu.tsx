"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/presentation/components/ui/menubar";
import { playSound } from "@/infrastructure/lib/utils";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { useAtom } from "jotai";
import { openWindowAtom } from "@/application/atoms/windowAtoms";
import { ResetDialog } from "./ResetDialog";

export const TaskbarMenu = () => {
  const openWindow = useAtom(openWindowAtom)[1];
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Function to open an app
  const openApp = (appId: string) => {
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
  };

  // Function to open URL in the current window
  const openUrl = (url: string) => {
    playSound("/sounds/click.mp3");
    window.open(url, "_blank");
  };

  // Function to open reset dialog
  const openResetDialog = () => {
    playSound("/sounds/click.mp3");
    setResetDialogOpen(true);
  };

  return (
    <>
      <MenubarMenu>
        <div className="px-1">
          <Image src="/icons/coffee.png" alt="coffee" width={20} height={20} />
        </div>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
          Menu
        </MenubarTrigger>
        <MenubarContent>
          {Object.entries(appRegistry).map(([appId, app]) => (
            <MenubarItem
              key={appId}
              onSelect={() => openApp(appId)}
              className="flex items-center gap-2"
            >
              <Image src={app.src} alt={app.name} width={16} height={16} />
              {app.name}
            </MenubarItem>
          ))}
          <MenubarSeparator />
          <MenubarItem
            inset
            onSelect={openResetDialog}
            className="text-destructive"
          >
            Reset System
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
          About
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            WFC OS<MenubarShortcut>v 1.0</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            onSelect={() => openUrl("https://x.com/ekmigasari")}
          >
            Xmigas <MenubarShortcut>creator</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            inset
            onSelect={() => openUrl("https://github.com/ekmigasari/wfcOS.git")}
          >
            Github<MenubarShortcut>repository</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Reset Dialog */}
      <ResetDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen} />
    </>
  );
};
