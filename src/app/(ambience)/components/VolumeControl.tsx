"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";
import { useAmbienceControls } from "@/application/hooks/useAmbienceControls";

export const VolumeControl = () => {
  const { isMuted, volume, handleToggleMute, handleVolumeChange } =
    useAmbienceControls();

  return (
    <div className="flex items-center space-x-2 px-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleMute}
        className="h-8 w-8 rounded-full"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </Button>

      <Slider
        value={[isMuted ? 0 : volume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        className="flex-1"
      />

      <span className="text-xs text-muted-foreground w-8 text-right">
        {Math.round((isMuted ? 0 : volume) * 100)}%
      </span>
    </div>
  );
};
