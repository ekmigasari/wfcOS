import React from "react";

import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";

interface ActionButtonsProps {
  hasChanges: boolean;
  onApply: () => void;
  onCancel: () => void;
}

export const ActionButtons = ({
  hasChanges,
  onApply,
  onCancel,
}: ActionButtonsProps) => {
  const handleApply = () => {
    playSound("/sounds/click.mp3");
    onApply();
  };

  const handleCancel = () => {
    playSound("/sounds/click.mp3");
    onCancel();
  };

  return (
    <div className="flex justify-end gap-2 mt-6">
      <Button
        variant="outline"
        onClick={handleCancel}
        size="sm"
        className="sm:size-default bg-white hover:bg-stone-200"
      >
        Cancel
      </Button>
      <Button
        variant="secondary"
        onClick={handleApply}
        disabled={!hasChanges}
        size="sm"
        className="sm:size-default min-w-20 hover:bg-accent text-white"
      >
        Apply
      </Button>
    </div>
  );
};
