"use client";

import { signOut } from "@/infrastructure/lib/auth-client";
import { Button } from "@/presentation/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { playSound } from "@/infrastructure/lib/utils";
import { LogOut } from "lucide-react";

export const SignOutButton = () => {
  const router = useRouter();

  async function handleClick() {
    playSound("/sounds/click.mp3");

    await signOut({
      fetchOptions: {
        onError: (ctx) => {
          toast.error(ctx.error?.message || "An error occurred");
        },
        onSuccess: () => {
          // Clear welcome toast state for all users
          const keys = Object.keys(sessionStorage).filter((key) =>
            key.startsWith("hasShownWelcomeToast_")
          );
          keys.forEach((key) => sessionStorage.removeItem(key));

          toast.success("Signed out successfully");
          router.refresh();
        },
      },
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full flex justify-start"
      onClick={handleClick}
    >
      <LogOut color="black" className="w-2 h-2 mr-2" />
      Sign Out
    </Button>
  );
};
