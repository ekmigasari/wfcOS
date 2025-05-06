import React, { useState, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  backgroundSettingsAtom,
  BackgroundSettings,
  previewBackgroundAtom,
  applyPreviewBackgroundAtom,
  BackgroundFit,
} from "@/application/atoms/backgroundAtom";
import { playSound } from "@/infrastructure/lib/utils";

// Import the components
import { BackgroundSelector } from "./components/BackgroundSelector";
import { NoImageOption } from "./components/NoImageOption";
import { BackgroundUploader } from "./components/BackgroundUploader";
import { BackgroundFitSelector } from "./components/BackgroundFitSelector";
import { SettingsActionButtons } from "@/presentation/components/shared/settings/SettingsActionButtons";

// Main component
interface BackgroundChangerProps {
  onClose?: () => void;
}

export const BackgroundChanger: React.FC<BackgroundChangerProps> = ({
  onClose,
}) => {
  const [savedSettings] = useAtom(backgroundSettingsAtom);
  const [previewSettings, setPreviewSettings] = useAtom(previewBackgroundAtom);
  const applyPreview = useSetAtom(applyPreviewBackgroundAtom);

  // Initialize temp settings to saved settings
  const [tempSettings, setTempSettings] =
    useState<BackgroundSettings>(savedSettings);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Effect to initialize tempSettings when savedSettings changes
  useEffect(() => {
    setTempSettings(savedSettings);
  }, [savedSettings]);

  // Effect to check if the saved URL is a custom one (data URL)
  useEffect(() => {
    if (savedSettings.url && savedSettings.url.startsWith("data:image")) {
      setUploadedImage(savedSettings.url);
    }
  }, [savedSettings.url]);

  // Update global preview whenever local temp settings change
  useEffect(() => {
    if (JSON.stringify(tempSettings) !== JSON.stringify(savedSettings)) {
      setPreviewSettings(tempSettings);
    } else {
      setPreviewSettings(null);
    }
  }, [tempSettings, savedSettings, setPreviewSettings]);

  // Reset preview background when component unmounts
  useEffect(() => {
    return () => {
      setPreviewSettings(null);
    };
  }, [setPreviewSettings]);

  const handleSelectBackground = (bgUrl: string | null) => {
    setTempSettings((prev) => ({ ...prev, url: bgUrl }));
  };

  const handleChangeFit = (value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      fit: value as BackgroundFit,
    }));
  };

  const handleUploadImage = (image: string) => {
    setUploadedImage(image);
  };

  const handleApply = () => {
    playSound("/sounds/click.mp3", "apply");
    applyPreview();
    onClose?.();
  };

  const handleCancel = () => {
    playSound("/sounds/click.mp3", "cancel");
    setPreviewSettings(null);
    onClose?.();
  };

  // Check if the global preview atom is set (meaning changes are staged)
  const hasChanges = previewSettings !== null;

  return (
    <div className="flex flex-col gap-2 items-center justify-start text-secondary h-full p-4">
      {/* Background Options */}
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4 w-full">
          {/* No Image Option */}
          <NoImageOption
            isSelected={tempSettings.url === null}
            onSelect={() => handleSelectBackground(null)}
          />

          {/* Upload Image Slot */}
          <BackgroundUploader
            uploadedImage={uploadedImage}
            tempSettings={tempSettings}
            onSelectBackground={handleSelectBackground}
            onUploadImage={handleUploadImage}
          />
        </div>

        {/* Background selector component */}
        <BackgroundSelector
          tempSettings={tempSettings}
          onSelectBackground={handleSelectBackground}
        />
      </div>

      {/* Fit Options */}
      <BackgroundFitSelector
        fit={tempSettings.fit}
        onChangeFit={handleChangeFit}
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

export default BackgroundChanger;
