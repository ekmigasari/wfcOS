import React, { useRef,useState } from "react";

import { playSound } from "@/infrastructure/lib/utils";
import { SettingsActionButtons } from "@/presentation/components/shared/settings/SettingsActionButtons";
import { SoundControl } from "@/presentation/components/shared/sound-control/SoundControl";

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
    <div className="flex flex-col gap-2 items-center justify-start text-secondary h-full p-4">
      {/* Sound Controls */}
      <SoundControl
        onSettingsChange={handleSettingsChange}
        onApplySettings={registerApplyFn}
        onRegisterResetFn={registerResetFn}
      />

      {/* Action Buttons */}
      <SettingsActionButtons
        hasChanges={hasChanges}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default SoundChanger;
