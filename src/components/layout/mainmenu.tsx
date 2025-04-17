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
import Image from "next/image";
import Clock from "../clock";
import { playSound } from "@/lib/utils";
import { appRegistry } from "@/config/appRegistry";
import { useAtom } from "jotai";
import { openWindowAtom } from "@/atoms/windowAtoms";

export function Mainmenu() {
  // Get the setter for opening windows
  const openWindow = useAtom(openWindowAtom)[1];

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

  // Function to open background changer
  const openBackgroundChanger = () => {
    playSound("/sounds/open.mp3");

    openWindow({
      id: "background-changer-instance",
      appId: "background",
      title: "Background Settings",
      minSize: { width: 470, height: 400 },
      initialSize: { width: 520, height: 470 },
    });
  };

  // Function to open URL in the current window
  const openUrl = (url: string) => {
    playSound("/sounds/click.mp3");
    window.open(url, "_blank");
  };

  return (
    <Menubar className="bg-primary border-secondary border-2 text-white">
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
            onSelect={openBackgroundChanger}
            className="flex items-center gap-2"
          >
            <Image
              src="/icons/settings.png"
              alt="Background"
              width={16}
              height={16}
            />
            Background
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
          Bookmark
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>Coming Soon</MenubarItem>
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
      <Clock />
    </Menubar>
  );
}

//
//
//
