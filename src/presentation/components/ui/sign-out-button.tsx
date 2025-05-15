"use client";

import { signOut } from "@/infrastructure/lib/auth-client";
import { Button } from "@/presentation/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter();
  async function handleClick() {
    await signOut({
      fetchOptions: {
        onError: (ctx) => {
          toast.error(ctx.error?.message || "An error occurred");
        },
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/profile");
        },
      },
    });
  }

  return <Button onClick={handleClick}>Sign Out</Button>;
};
