"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { SignOutButton } from "@/presentation/components/ui/sign-out-button";
import { useOpenUserSettings } from "@/app/(user-settings)/openUserSettings";
import { toast } from "sonner";
import { useSessionContext } from "@/providers/SessionProvider";

export const AuthMenu = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const openUserSettings = useOpenUserSettings();
  const session = useSessionContext();

  useEffect(() => {
    // Only show toast if user is logged in
    if (!session?.user?.id) return;

    // Create a unique key for this user's session to track if we've shown the welcome toast
    const welcomeToastKey = `hasShownWelcomeToast_${session.user.id}`;
    const hasShownToast = sessionStorage.getItem(welcomeToastKey) === "true";

    if (!hasShownToast) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        // First try a simple success toast to test if toasts work at all
        toast(
          <span className="font-bold text-md">
            Welcome {session.user?.name || "User"}
          </span>,
          {
            description:
              "Hope you're having a productive day and enjoying your coffee ☕",
            duration: 5000,
            className: "bg-white border-secondary border-2 w-fit",
            style: {
              background: "white",
              border: "2px solid var(--secondary)",
              borderRadius: "8px",
            },
          }
        );

        sessionStorage.setItem(welcomeToastKey, "true");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, session?.user?.name]);

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
