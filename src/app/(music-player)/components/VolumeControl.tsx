"use client";

import { useAtom } from "jotai";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Slider } from "@/presentation/components/ui/slider";
import {
  musicPlayerAtom,
  setVolumeAtom,
  toggleMuteAtom,
} from "@/application/atoms/musicPlayerAtom";

const VolumeControl = () => {
  const [playerState] = useAtom(musicPlayerAtom);
  const [, setVolume] = useAtom(setVolumeAtom);
  const [, toggleMute] = useAtom(toggleMuteAtom);

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8 rounded-full p-0"
      >
        {playerState.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </Button>

      <Slider
        value={[playerState.isMuted ? 0 : playerState.volume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        className="flex-1"
      />

      <span className="text-xs text-muted-foreground w-8 text-right">
        {Math.round((playerState.isMuted ? 0 : playerState.volume) * 100)}%
      </span>
    </div>
  );
};

export default VolumeControl;
