import Image from "next/image";
import React, { useRef } from "react";

import { BackgroundSettings } from "@/application/atoms/backgroundAtom";

interface BackgroundUploaderProps {
  uploadedImage: string | null;
  tempSettings: BackgroundSettings;
  onSelectBackground: (bgUrl: string | null) => void;
  onUploadImage: (image: string) => void;
}

export const BackgroundUploader = ({
  uploadedImage,
  tempSettings,
  onSelectBackground,
  onUploadImage,
}: BackgroundUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Size check
      if (result.length > 4 * 1024 * 1024) {
        alert("Image too large! Please select an image smaller than 4MB.");
        return;
      }
      onUploadImage(result);
      onSelectBackground(result);
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  return (
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
  );
};
