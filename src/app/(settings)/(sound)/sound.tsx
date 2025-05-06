import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { SoundControl } from "@/presentation/components/shared/sound-control/SoundControl";
import { SettingsActionButtons } from "@/presentation/components/shared/settings/SettingsActionButtons";
import { playSound } from "@/infrastructure/lib/utils";

interface SoundChangerProps {
  onClose?: () => void;
}

export const SoundChanger: React.FC<SoundChangerProps> = ({ onClose }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const applyFnRef = useRef<(() => void) | null>(null);
  const resetFnRef = useRef<(() => void) | null>(null);

  const handleSettingsChange = () => {
    setHasChanges(true);
  };

  const handleApply = () => {
    // Play sound once at the parent level
    playSound("/sounds/click.mp3", "apply");

    // Apply the changes
    if (applyFnRef.current) {
      applyFnRef.current();
    }

    setHasChanges(false);
    onClose?.();
  };

  const handleCancel = () => {
    playSound("/sounds/click.mp3", "cancel");

    // Reset the temporary state in SoundControl if necessary
    resetFnRef.current?.();

    setHasChanges(false);
    onClose?.();
  };

  const registerApplyFn = (applyFn: () => void) => {
    applyFnRef.current = applyFn;
  };

  // Function to register the reset function from SoundControl
  const registerResetFn = (resetFn: () => void) => {
    resetFnRef.current = resetFn;
  };

  return (
    <Card className="w-full max-w-[95vw] sm:max-w-[500px] lg:max-w-none bg-card text-card-foreground border-none shadow-none">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium mb-4">Sound Settings</h3>

          {/* Sound Controls */}
          <SoundControl
            onSettingsChange={handleSettingsChange}
            onApplySettings={registerApplyFn}
            onRegisterResetFn={registerResetFn}
          />
        </div>

        {/* Action Buttons */}
        <SettingsActionButtons
          hasChanges={hasChanges}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
};

export default SoundChanger;
