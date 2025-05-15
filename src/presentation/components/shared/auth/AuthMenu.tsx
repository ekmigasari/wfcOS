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
import { LogIn } from "lucide-react";

export const AuthMenu = () => {
  // Function to open login dialog
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const openLoginDialog = () => {
    playSound("/sounds/click.mp3");
    setLoginDialogOpen(true);
  };

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger onPointerDown={() => playSound("/sounds/click.mp3")}>
          Menu
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset>Blog</MenubarItem>
          <MenubarItem inset>Feedback</MenubarItem>
          <MenubarItem inset>User Settings</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={openLoginDialog}>
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
};
