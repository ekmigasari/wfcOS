"use client";

import { useAtom } from "jotai";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { isSoundMutedAtom } from "@/application/atoms/soundAtoms";
import { playSound, setSoundMuted } from "@/infrastructure/lib/utils";
import { useEffect, useState } from "react";

export const SoundToggle = () => {
  // Local state to force re-render, even if atom hasn't synced yet
  const [localMuted, setLocalMuted] = useState(false);

  // Keep atom in sync for persistence
  const [atomMuted, setAtomMuted] = useAtom(isSoundMutedAtom);

  // Initialize local state from atom
  useEffect(() => {
    setLocalMuted(atomMuted);
  }, [atomMuted]);

  const toggleMute = () => {
    const newMuteState = !localMuted;

    // Update local state for immediate UI update
    setLocalMuted(newMuteState);

    // Update the atom for persistence
    setAtomMuted(newMuteState);

    // Use direct access to ensure changes take effect immediately
    setSoundMuted(newMuteState);

    // Play a quick test sound when unmuting
    if (!newMuteState) {
      setTimeout(() => {
        playSound("/sounds/click.mp3", "toggle");
      }, 100);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={toggleMute}
      title={localMuted ? "Unmute click sounds" : "Mute click sounds"}
    >
      {localMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </Button>
  );
};
