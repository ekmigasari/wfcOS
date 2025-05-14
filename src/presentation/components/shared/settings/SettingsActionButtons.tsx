import React from "react";

import { Button } from "@/presentation/components/ui/button";

interface SettingsActionButtonsProps {
  hasChanges: boolean;
  onApply: () => void;
  onCancel: () => void;
}

export const SettingsActionButtons = ({
  hasChanges,
  onApply,
  onCancel,
}: SettingsActionButtonsProps) => {
  // No sound playing here - parent components handle sound
  return (
    <div className="flex justify-end gap-2 mt-6 w-full">
      <Button
        variant="outline"
        onClick={onCancel}
        size="sm"
        className="sm:size-default bg-white hover:bg-stone-200"
      >
        Cancel
      </Button>
      <Button
        variant="secondary"
        onClick={onApply}
        disabled={!hasChanges}
        size="sm"
        className="sm:size-default min-w-20 hover:bg-accent text-white"
      >
        Apply
      </Button>
    </div>
  );
};
