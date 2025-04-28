"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
}

export const VolumeControl = ({
  volume,
  isMuted,
  handleVolumeChange,
  toggleMute,
}: VolumeControlProps) => {
  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8 rounded-full p-0"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </Button>

      <Slider
        value={[displayVolume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        className="flex-1"
      />

      <span className="text-xs text-muted-foreground w-8 text-right">
        {Math.round(displayVolume * 100)}%
      </span>
    </div>
  );
};

export default VolumeControl;
