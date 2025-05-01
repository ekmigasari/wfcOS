"use client";

import React from "react";
import { AmbienceSound } from "@/application/hooks/useAmbienceAudio";
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
  isLoading: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
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
        disabled={isLoading}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200 disabled:opacity-50"
      >
        <SkipBack size={20} />
      </Button>
      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        disabled={isLoading}
        className="bg-accent hover:bg-secondary disabled:opacity-50"
      >
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-stone-500 border-t-transparent" />
        ) : isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={isLoading}
        className="text-stone-700 hover:text-stone-900 hover:bg-stone-200 disabled:opacity-50"
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
  isLoading: boolean;
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
  isLoading,
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
          isLoading={isLoading}
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
