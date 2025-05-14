import React from "react";

import { playSound } from "@/infrastructure/lib/utils";

interface NoImageOptionProps {
  isSelected: boolean;
  onSelect: () => void;
}

export const NoImageOption = ({ isSelected, onSelect }: NoImageOptionProps) => {
  const handleSelect = () => {
    playSound("/sounds/click.mp3");
    onSelect();
  };

  return (
    <div
      className={`cursor-pointer border-2 transition-colors ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-muted hover:border-primary/50 bg-muted"
      } rounded-md overflow-hidden flex items-center justify-center h-[60px] sm:h-[70px]`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleSelect();
        }
      }}
    >
      <div className="text-center text-xs sm:text-sm font-medium">No Image</div>
    </div>
  );
};
