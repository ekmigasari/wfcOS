"use client";

import React, { useEffect } from "react";
import { TrackInfo } from "@/app/(ambience)/components/TrackInfo";
import { PlayerControls } from "@/app/(ambience)/components/PlayerControls";
import { VolumeControl } from "@/app/(ambience)/components/VolumeControl";
import { useAtom } from "jotai";
import {
  isPlayingAtom,
  persistAmbiencePlayerState,
} from "@/application/atoms/ambiencePlayerAtom";

// Create a provider component to ensure hooks are only initialized once
// and proper unmount behavior
const AmbiencePlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [, setIsPlaying] = useAtom(isPlayingAtom);
  const [, persistState] = useAtom(persistAmbiencePlayerState);

  // When component is mounted (or remounted), ensure we start with isPlaying false
  // This prevents autoplay violations after refresh
  useEffect(() => {
    setIsPlaying(false);
    persistState({ isPlaying: false });

    // When component unmounts (page navigation/refresh)
    // ensure we reset to stopped state
    return () => {
      setIsPlaying(false);
      persistState({ isPlaying: false });
    };
  }, [setIsPlaying, persistState]);

  return <>{children}</>;
};

type AmbiencePlayerProps = {
  windowId?: string;
};

const AmbiencePlayer: React.FC<AmbiencePlayerProps> = () => {
  return (
    <AmbiencePlayerProvider>
      <div className="flex flex-col h-full p-3 bg-stone-100">
        <div className="flex justify-between">
          <TrackInfo />
          <PlayerControls />
        </div>
        <VolumeControl />
      </div>
    </AmbiencePlayerProvider>
  );
};

export default AmbiencePlayer;
