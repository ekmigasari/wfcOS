"use client";

import React from "react";
import Image from "next/image";
import { useDeviceDetect } from "@/application/hooks";

interface AppIconProps {
  src: string;
  name: string;
  appId: string;
  onOpenApp: (appId: string) => void;
}

//Single App Icon
export const AppIcon = ({ src, name, appId, onOpenApp }: AppIconProps) => {
  // Use the new hook instead of the local state and useEffect
  const { isMobileOrTablet } = useDeviceDetect();

  const handleClick = () => {
    // For mobile/tablet, open on single click
    if (isMobileOrTablet) {
      onOpenApp(appId);
    }
  };

  const handleDoubleClick = () => {
    // For desktop, open on double click
    if (!isMobileOrTablet) {
      onOpenApp(appId);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded transition-opacity duration-150 ease-in-out min-w-24"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={60}
        className={`drop-shadow-lg`}
      />
      <p className="px-1 font-tight shadow-lg mt-1 rounded text-sm bg-white text-primary">
        {name}
      </p>
    </div>
  );
};
