"use client";

import React from "react";
import { Video } from "lucide-react";

interface VideoToggleProps {
  showVideo: boolean;
  toggleVideoDisplay: () => void;
  disabled: boolean;
}

export const VideoToggle = ({
  showVideo,
  toggleVideoDisplay,
  disabled,
}: VideoToggleProps) => {
  return (
    <div className="flex justify-center mb-4">
      <button
        onClick={toggleVideoDisplay}
        className="px-3 py-1 text-sm rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2"
        disabled={disabled}
      >
        <Video className="w-4 h-4" />
        {showVideo ? "Hide Video" : "Show Video"}
      </button>
    </div>
  );
};

export default VideoToggle;
