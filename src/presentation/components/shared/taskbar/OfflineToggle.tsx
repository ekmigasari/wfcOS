"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { playSound } from "@/infrastructure/lib/utils";
import {
  areAssetsCached,
  cacheCurrentAppShell,
  downloadOfflinePack,
} from "@/infrastructure/pwa/cacheAssets";
import {
  OFFLINE_PACK_URLS,
  OFFLINE_PACK_VERSION,
  OFFLINE_PACK_VERSION_STORAGE_KEY,
} from "@/infrastructure/pwa/offlineAssets";
import { preloadOfflineModules } from "@/infrastructure/pwa/preloadOfflineModules";
import { Button } from "@/presentation/components/ui/button";
import {
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/presentation/components/ui/menubar";

type OfflineState =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "update"
  | "error";

const getStoredOfflinePackVersion = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(OFFLINE_PACK_VERSION_STORAGE_KEY);
};

const setStoredOfflinePackVersion = (version: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(OFFLINE_PACK_VERSION_STORAGE_KEY, version);
};

export const OfflineToggle = () => {
  const [offlineState, setOfflineState] = useState<OfflineState>("checking");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkOfflinePack = async () => {
      const isReady = await areAssetsCached(OFFLINE_PACK_URLS);
      const storedVersion = getStoredOfflinePackVersion();

      if (!isMounted) {
        return;
      }

      if (!isReady) {
        setOfflineState("idle");
        setDownloadProgress(0);
        return;
      }

      setDownloadProgress(OFFLINE_PACK_URLS.length);
      setOfflineState(
        storedVersion === OFFLINE_PACK_VERSION ? "ready" : "update"
      );
    };

    void checkOfflinePack();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOfflinePackAction = async () => {
    playSound("/sounds/click.mp3");
    setOfflineState("downloading");
    setDownloadProgress(0);

    await preloadOfflineModules();
    const shellReady = await cacheCurrentAppShell();
    const result = await downloadOfflinePack(OFFLINE_PACK_URLS, {
      concurrency: 3,
      onProgress: (completed) => {
        setDownloadProgress(completed);
      },
    });

    if (shellReady && result.failed.length === 0) {
      setStoredOfflinePackVersion(OFFLINE_PACK_VERSION);
      setOfflineState("ready");
      return;
    }

    setOfflineState("error");
  };

  const getIcon = () => {
    switch (offlineState) {
      case "downloading":
      case "checking":
        return <LoaderCircle size={16} className="animate-spin" />;
      case "ready":
        return <CheckCircle2 size={16} />;
      case "update":
        return <RefreshCw size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return <Download size={16} />;
    }
  };

  const actionLabel =
    offlineState === "ready"
      ? "Offline mode ready to use"
      : offlineState === "downloading"
        ? "Downloading offline pack"
        : offlineState === "update"
          ? "Update offline pack"
          : offlineState === "error"
            ? "Retry offline download"
            : "Make available offline";

  const statusLabel =
    offlineState === "ready"
      ? "App is ready offline."
      : offlineState === "downloading"
        ? "Downloading essentials..."
        : offlineState === "update"
          ? "A newer offline pack is available."
          : offlineState === "error"
            ? "Some offline assets failed."
            : "Save core app files for offline use.";

  const buttonTitle =
    offlineState === "ready"
      ? "Offline essentials are ready"
      : offlineState === "update"
        ? "Offline update available"
        : actionLabel;

  return (
    <MenubarMenu>
      <MenubarTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title={buttonTitle}
          onPointerDown={() => playSound("/sounds/click.mp3")}
        >
          {getIcon()}
        </Button>
      </MenubarTrigger>
      <MenubarContent align="end" className="w-72 min-w-0">
        <MenubarLabel className="text-primary text-xs">
          OFFLINE MODE
        </MenubarLabel>
        <MenubarItem className="text-xs" disabled>
          {statusLabel}
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem
          inset
          disabled={
            offlineState === "downloading" || offlineState === "checking"
          }
          onSelect={handleOfflinePackAction}
        >
          {actionLabel}
          <MenubarShortcut>
            {offlineState === "downloading"
              ? `${downloadProgress}/${OFFLINE_PACK_URLS.length}`
              : offlineState === "ready"
                ? "done"
                : offlineState === "update"
                  ? "new"
                  : ""}
          </MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};
