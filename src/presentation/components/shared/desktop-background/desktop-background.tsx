"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { activeBackgroundAtom } from "@/application/atoms/backgroundAtom";
import Image from "next/image";

export const DesktopBackground = () => {
  const settings = useAtomValue(activeBackgroundAtom);

  // If no background is selected, return just a background color
  if (!settings.url) {
    return <div className="fixed inset-0 w-full h-full -z-20 bg-background" />;
  }

  // Apply different styling based on fit option
  const getObjectFit = () => {
    switch (settings.fit) {
      case "fill":
        return "object-cover";
      case "fit":
        return "object-contain";
      case "stretch":
        return "object-fill";
      case "center":
        return "object-none object-center";
      case "tile":
        return "bg-repeat"; // This will be handled differently
      default:
        return "object-cover";
    }
  };

  // For tiled backgrounds, use a div with background-image instead of Image component
  if (settings.fit === "tile") {
    return (
      <div
        className="fixed inset-0 w-full h-full -z-20"
        style={{
          backgroundImage: `url(${settings.url})`,
          backgroundRepeat: "repeat",
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full -z-20">
      <Image
        src={settings.url}
        alt="Desktop background"
        fill
        priority
        quality={100}
        className={getObjectFit()}
      />
    </div>
  );
};

export default DesktopBackground;
