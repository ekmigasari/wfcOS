"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Clock from "../clock";
import { playSound } from "@/lib/utils";
import { appRegistry } from "@/config/appRegistry";
import { useAtom } from "jotai";
import { openWindowAtom } from "@/atoms/windowAtoms";
import { useState } from "react";

export function Mainmenu() {
  // Get the setter for opening windows
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

  // Function to handle reset confirmation
  const handleResetConfirm = () => {
    playSound("/sounds/click.mp3");

    // Add a small delay to ensure the sound plays completely
    setTimeout(() => {
      setResetDialogOpen(false);

      // Create a direct instance of the ResetSystem component
      const resetSystem = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      };

      resetSystem();
    }, 300); // 300ms delay
  };

  // Function to open reset dialog
  const openResetDialog = () => {
    playSound("/sounds/click.mp3");
    setResetDialogOpen(true);
  };

  return (
    <>
      <Menubar className="bg-primary border-secondary border-2 text-white z-[1500] relative">
        <MenubarMenu>
          <div className="px-1">
            <Image
              src="/icons/coffee.png"
              alt="coffee"
              width={20}
              height={20}
            />
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
        {/* <MenubarMenu>
          <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
            Bookmark
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>Coming Soon</MenubarItem>
          </MenubarContent>
        </MenubarMenu> */}
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
              onSelect={() =>
                openUrl("https://github.com/ekmigasari/wfcOS.git")
              }
            >
              Github<MenubarShortcut>repository</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <Clock />
      </Menubar>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onOpenChange={(open) => {
          if (!open) playSound("/sounds/close.mp3");
          setResetDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-2 border-secondary z-[2500] shadow">
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset System</DialogTitle>
            <DialogDescription>
              This will reset all settings and data to their default values.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playSound("/sounds/close.mp3");
                setResetDialogOpen(false);
              }}
              className="bg-white hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetConfirm}
              className="hover:bg-accent"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

//
//
//
