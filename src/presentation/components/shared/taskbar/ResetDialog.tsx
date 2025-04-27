"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { playSound } from "@/infrastructure/lib/utils";

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetDialog = ({ open, onOpenChange }: ResetDialogProps) => {
  const handleResetConfirm = () => {
    playSound("/sounds/click.mp3");

    // Add a small delay to ensure the sound plays completely
    setTimeout(() => {
      onOpenChange(false);

      // Reset system
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }, 300); // 300ms delay
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) playSound("/sounds/close.mp3");
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md bg-white border-2 border-secondary z-[2500] shadow">
        <DialogHeader>
          <DialogTitle className="text-destructive">Reset System</DialogTitle>
          <DialogDescription>
            This will reset all settings and data to their default values. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              playSound("/sounds/close.mp3");
              onOpenChange(false);
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
  );
};
