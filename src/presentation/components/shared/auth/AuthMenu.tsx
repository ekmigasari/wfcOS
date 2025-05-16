"use client";

import { useState } from "react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/presentation/components/ui/menubar";
import { playSound } from "@/infrastructure/lib/utils";
import { LoginDialog } from "./LoginDialog";
import { LogIn, User } from "lucide-react";
import { useSession } from "@/infrastructure/lib/auth-client";
import Image from "next/image";
import { SignOutButton } from "@/presentation/components/ui/sign-out-button";
import { useOpenUserSettings } from "@/app/(user-settings)/openUserSettings";

export const AuthMenu = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const openUserSettings = useOpenUserSettings();

  const { data: session } = useSession();

  const openLoginDialog = () => {
    playSound("/sounds/click.mp3");
    setLoginDialogOpen(true);
  };

  const openUrl = (url: string) => {
    playSound("/sounds/click.mp3");
    window.open(url, "_blank");
  };

  // Function to open changelog window
  const openUserSettingsWindow = () => {
    playSound("/sounds/open.mp3");
    openUserSettings();
  };

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
          Menu
        </MenubarTrigger>
        <MenubarContent>
          {session ? (
            <>
              <div className="flex items-center gap-2 px-2 py-1">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {session.user?.name}
              </div>
              <MenubarSeparator />
            </>
          ) : null}
          <MenubarItem inset onSelect={() => openUrl("/blog")}>
            Blog
          </MenubarItem>
          <MenubarItem
            inset
            onSelect={() => openUrl("https://workfromcoffee.featurebase.app/")}
          >
            Feedback
          </MenubarItem>
          {session ? (
            <>
              <MenubarItem inset onSelect={openUserSettingsWindow}>
                User Settings
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <SignOutButton />
              </MenubarItem>
            </>
          ) : (
            <>
              <MenubarSeparator />
              <MenubarItem onSelect={openLoginDialog}>
                <LogIn color="black" className="w-2 h-2 mr-2" />
                Login
              </MenubarItem>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
};
