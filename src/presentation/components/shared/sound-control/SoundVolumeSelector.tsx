"use client";

import React from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/presentation/components/ui/radio-group";
import { Label } from "@/presentation/components/ui/label";
import { SoundVolumeLevel } from "@/application/atoms/soundAtoms";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";

interface SoundVolumeSelectorProps {
  selectedLevel: SoundVolumeLevel;
  onSelect: (level: SoundVolumeLevel) => void;
}

// Helper component for each radio option to match the design
const VolumeOption = ({
  id,
  value,
  label,
  icon: Icon,
  checked,
}: {
  id: string;
  value: string;
  label: string;
  icon: React.ElementType;
  checked: boolean;
}) => (
  <Label
    htmlFor={id}
    className="flex flex-col items-center justify-between space-y-2 cursor-pointer p-2 rounded-md hover:bg-accent/50"
  >
    <Icon
      size={20}
      className={`mb-1 ${checked ? "text-primary" : "text-muted-foreground"}`}
    />
    <span
      className={`text-sm font-medium ${
        checked ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {label}
    </span>
    <RadioGroupItem value={value} id={id} className="mt-2" />{" "}
    {/* Visible radio button */}
  </Label>
);

export const SoundVolumeSelector = ({
  selectedLevel,
  onSelect,
}: SoundVolumeSelectorProps) => {
  const handleValueChange = (value: string) => {
    onSelect(value as SoundVolumeLevel);
  };

  return (
    <div className="space-y-3 bg-amber-400">
      <h3 className="text-sm font-medium text-muted-foreground">
        Sound Effects Volume
      </h3>
      <RadioGroup
        value={selectedLevel}
        onValueChange={handleValueChange}
        className="grid grid-cols-4 gap-2"
      >
        <VolumeOption
          id="mute"
          value="mute"
          label="Mute"
          icon={VolumeX}
          checked={selectedLevel === "mute"}
        />
        <VolumeOption
          id="low"
          value="low"
          label="Low"
          icon={Volume}
          checked={selectedLevel === "low"}
        />
        <VolumeOption
          id="medium"
          value="medium"
          label="Med" // Shortened label
          icon={Volume1}
          checked={selectedLevel === "medium"}
        />
        <VolumeOption
          id="full"
          value="full"
          label="Full"
          icon={Volume2}
          checked={selectedLevel === "full"}
        />
      </RadioGroup>
    </div>
  );
};
