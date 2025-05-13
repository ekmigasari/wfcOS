"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import Image from "next/image";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // UI-only mock function for Google auth (no actual implementation)
  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            ☕ Welcome to WFC OS
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your personalized workspace
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="py-2">
            <div className="flex flex-col space-y-4">
              <Button
                variant="default"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                )}
                <span>Continue with Google</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="py-2">
            <div className="flex flex-col space-y-4">
              <Button
                variant="default"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                )}
                <span>Sign up with Google</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Secured by WFC OS</span>
            <Image
              src="/icons/coffee.png"
              alt="WFC"
              width={16}
              height={16}
              className="ml-1"
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
