"use client";

import React from "react";
import { TrackInfo } from "@/app/(ambience)/components/TrackInfo";
import { PlayerControls } from "@/app/(ambience)/components/PlayerControls";
import { VolumeControl } from "@/app/(ambience)/components/VolumeControl";

export const AmbiencePlayer: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-3 bg-stone-100">
      <div className="flex justify-between">
        <TrackInfo />
        <PlayerControls />
      </div>
      <VolumeControl />
    </div>
  );
};
