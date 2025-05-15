"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { GoogleButton } from "../../ui/google-button";
import { playSound } from "@/infrastructure/lib/utils";
interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-secondary border-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Welcome to WFC OS ☕
          </DialogTitle>
          <DialogDescription className="text-center">
            Login to access your personalized workspace
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="login" onPointerDown={() => playSound("/sounds/click.mp3")}>Login</TabsTrigger>
            <TabsTrigger value="signup" onPointerDown={() => playSound("/sounds/click.mp3")}>Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="py-2">
            <div className="flex flex-col space-y-4">
              <GoogleButton />
            </div>
          </TabsContent>

          <TabsContent value="signup" className="py-2">
            <div className="flex flex-col space-y-4">
              <GoogleButton signUp />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-center mt-2">
          <div className="flex items-center text-xs text-muted-foreground mx-auto justify-center">
            <span>© WFC OS 2025</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
