"use client";

import { useAtomValue } from "jotai";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  activeBackgroundAtom,
  isCustomBackgroundUrl,
} from "@/application/atoms/backgroundAtom";
import { cacheAssetInBackground } from "@/infrastructure/pwa/cacheAssets";
import { getUploadedBackgroundObjectUrl } from "@/infrastructure/utils/backgroundImageStorage";

export const DesktopBackground = () => {
  const settings = useAtomValue(activeBackgroundAtom);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(settings.url);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const resolveBackground = async () => {
      if (!isCustomBackgroundUrl(settings.url)) {
        if (settings.url) {
          void cacheAssetInBackground(settings.url);
        }
        if (isMounted) {
          setResolvedUrl(settings.url);
        }
        return;
      }

      objectUrl = await getUploadedBackgroundObjectUrl();
      if (isMounted) {
        setResolvedUrl(objectUrl);
      }
    };

    void resolveBackground();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [settings.url]);

  // If no background is selected, return just a background color
  if (!resolvedUrl) {
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
          backgroundImage: `url(${resolvedUrl})`,
          backgroundRepeat: "repeat",
        }}
      />
    );
  }

  if (resolvedUrl.startsWith("blob:") || resolvedUrl.startsWith("data:")) {
    return (
      <div className="fixed inset-0 w-full h-full -z-20">
        <img
          src={resolvedUrl}
          alt="Desktop background"
          className={`w-full h-full ${getObjectFit()}`}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full -z-20">
      <Image
        src={resolvedUrl}
        alt="Desktop background"
        fill
        quality={80}
        sizes="100vw"
        className={getObjectFit()}
      />
    </div>
  );
};

export default DesktopBackground;
