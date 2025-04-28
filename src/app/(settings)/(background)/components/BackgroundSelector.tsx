import React from "react";
import Image from "next/image";
import { BackgroundSettings } from "@/application/atoms/backgroundAtom";
import { playSound } from "@/infrastructure/lib/utils";

// Constants
const backgrounds = [
  "/background/bg-1.png",
  "/background/bg-2.png",
  "/background/bg-3.png",
  "/background/bg-4.png",
  "/background/bg-5.png",
  "/background/bg-6.png",
  "/background/bg-7.png",
];

// Component for handling background image selection
interface BackgroundSelectorProps {
  tempSettings: BackgroundSettings;
  onSelectBackground: (bgUrl: string | null) => void;
}

export const BackgroundSelector = ({
  tempSettings,
  onSelectBackground,
}: BackgroundSelectorProps) => {
  const handleSelectBackground = (bgUrl: string | null) => {
    playSound("/sounds/click.mp3");
    onSelectBackground(bgUrl);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
  );
};

export { backgrounds };
