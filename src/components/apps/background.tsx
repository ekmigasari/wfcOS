import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAtom, useSetAtom } from "jotai";
import {
  backgroundSettingsAtom,
  BackgroundFit,
  BackgroundSettings,
  previewBackgroundAtom,
  applyPreviewBackgroundAtom,
} from "@/atoms/backgroundAtom";
import { playSound } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const backgrounds = [
  "/background/bg-1.png",
  "/background/bg-2.png",
  "/background/bg-3.png",
  "/background/bg-4.png",
  "/background/bg-5.png",
  "/background/bg-6.png",
  "/background/bg-7.png",
];

const fitOptions: { value: BackgroundFit; label: string }[] = [
  { value: "fill", label: "Fill" },
  { value: "fit", label: "Fit" },
  { value: "stretch", label: "Stretch" },
  { value: "tile", label: "Tile" },
  { value: "center", label: "Center" },
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to initialize tempSettings when savedSettings changes (e.g., on initial load from storage)
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
    // Only set the preview if tempSettings actually differs from savedSettings
    if (JSON.stringify(tempSettings) !== JSON.stringify(savedSettings)) {
      setPreviewSettings(tempSettings);
    } else {
      // If tempSettings is the same as savedSettings, clear the preview
      setPreviewSettings(null);
    }
    // No cleanup needed here as preview is managed explicitly
  }, [tempSettings, savedSettings, setPreviewSettings]);

  // Reset preview background when component unmounts (window closes without applying)
  useEffect(() => {
    // Return cleanup function that will run when component unmounts
    return () => {
      // Reset preview background to null when component unmounts
      setPreviewSettings(null);
    };
  }, [setPreviewSettings]);

  const handleSelectBackground = (bgUrl: string | null) => {
    playSound("/sounds/click.mp3");
    setTempSettings((prev) => ({ ...prev, url: bgUrl }));
  };

  const handleChangeFit = (value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      fit: value as BackgroundFit,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file."); // Basic error handling
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Very basic size check (e.g., < 4MB to avoid localStorage issues)
      if (result.length > 4 * 1024 * 1024) {
        alert("Image too large! Please select an image smaller than 4MB.");
        return;
      }
      setUploadedImage(result);
      handleSelectBackground(result); // Select the uploaded image
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    playSound("/sounds/click.mp3");
    // Use the applyPreview atom setter
    // This reads previewBackgroundAtom, updates backgroundSettingsAtom, and clears previewBackgroundAtom
    applyPreview();
    onClose?.();
  };

  const handleCancel = () => {
    playSound("/sounds/click.mp3");
    // Clear the global preview atom; activeBackgroundAtom will revert to savedSettings
    setPreviewSettings(null);
    // tempSettings will reset automatically via the useEffect hook listening to savedSettings
    // if the component stays mounted, or naturally on remount.
    onClose?.();
  };

  // Check if the global preview atom is set (meaning changes are staged)
  const hasChanges = previewSettings !== null;

  return (
    <Card className="w-full max-w-[95vw] sm:max-w-[500px] lg:max-w-none bg-card text-card-foreground border-none shadow-none">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Background Options */}
        <div>
          <h3 className="text-sm font-medium mb-2">Image</h3>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
            {/* No Image Option */}
            <div
              className={`cursor-pointer border-2 transition-colors ${
                tempSettings.url === null
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50 bg-muted"
              } rounded-md overflow-hidden flex items-center justify-center h-[60px] sm:h-[70px]`}
              onClick={() => handleSelectBackground(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelectBackground(null);
                }
              }}
            >
              <div className="text-center text-xs sm:text-sm font-medium">
                No Image
              </div>
            </div>

            {/* Upload Image Slot */}
            <div
              className={`cursor-pointer border-2 transition-colors relative ${
                uploadedImage && tempSettings.url === uploadedImage
                  ? "border-primary"
                  : "border-muted hover:border-primary/50 bg-muted"
              } rounded-md overflow-hidden flex items-center justify-center h-[60px] sm:h-[70px]`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
            >
              {uploadedImage ? (
                <Image
                  src={uploadedImage}
                  alt="Uploaded Background"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="text-center text-xs sm:text-sm font-medium">
                  +Upload
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {/* Background Images */}
            {backgrounds.map((bg) => (
              <div
                key={bg}
                className={`cursor-pointer border-2 transition-colors ${
                  tempSettings.url === bg
                    ? "border-primary"
                    : "border-transparent hover:border-primary/50"
                } rounded-md overflow-hidden aspect-video`}
                onClick={() => handleSelectBackground(bg)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectBackground(bg);
                  }
                }}
              >
                <Image
                  src={bg}
                  alt={`Background ${bg.split("/").pop()?.split(".")[0]}`}
                  width={100}
                  height={70}
                  sizes="(max-width: 640px) 150px, 200px"
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fit Options */}
        <div>
          <label
            htmlFor="fit-selector"
            className="block text-sm font-medium mb-2"
          >
            Image Fit
          </label>
          <Select value={tempSettings.fit} onValueChange={handleChangeFit}>
            <SelectTrigger className="w-full" id="fit-selector">
              <SelectValue placeholder="Select fit style" />
            </SelectTrigger>
            <SelectContent>
              {fitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className="sm:size-default"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleApply}
            disabled={!hasChanges}
            size="sm"
            className="sm:size-default min-w-20"
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundChanger;
