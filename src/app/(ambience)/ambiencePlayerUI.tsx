"use client";

import React from "react";
import { AmbienceSound } from "@/application/atoms/ambiencePlayerAtom";
import { Slider } from "@/presentation/components/ui/slider";
import { Button } from "@/presentation/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TrackInfoProps {
  currentSound: AmbienceSound;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({ currentSound }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold text-stone-800">
        {currentSound.title}
      </h3>
      <p className="text-sm text-stone-500">Ambient Sound</p>
    </div>
  );
};

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200"
      >
        <SkipBack size={20} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPlayPause}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200"
      >
        <SkipForward size={20} />
      </Button>
    </div>
  );
};

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  onMuteToggle,
}) => {
  return (
    <div className="flex items-center mt-4 space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200"
      >
        {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      <Slider
        value={[volume * 100]}
        max={100}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0] / 100)}
        className="w-full"
      />
      <span className="text-xs text-stone-500 w-8 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};

interface AmbiencePlayerUIProps {
  currentSound: AmbienceSound;
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export const AmbiencePlayerUI: React.FC<AmbiencePlayerUIProps> = ({
  currentSound,
  isPlaying,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onMuteToggle,
}) => {
  return (
    <div className="flex flex-col h-full p-3 bg-stone-100 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <TrackInfo currentSound={currentSound} />
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </div>
      <VolumeControl
        volume={volume}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
      />
    </div>
  );
};
