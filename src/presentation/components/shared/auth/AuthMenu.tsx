import React from "react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/presentation/components/ui/menubar";

export const AuthMenu = () => {
  return (
    <MenubarMenu>
      <MenubarTrigger>Menu</MenubarTrigger>
      <MenubarContent>
        <MenubarItem inset>Blog</MenubarItem>
        <MenubarItem inset>Feedback</MenubarItem>
        <MenubarItem inset>User Settings</MenubarItem>
        <MenubarSeparator />
        {/* <MenubarItem onSelect={openLoginDialog}>
      <LogIn className="w-4 h-4 mr-2" />
      Login
    </MenubarItem> */}
      </MenubarContent>
    </MenubarMenu>
  );
};
