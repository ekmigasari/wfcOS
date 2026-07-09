"use client";

import { useAtom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  closeWindowAtom,
  focusWindowAtom,
  openWindowIdsAtom,
  windowRegistryAtom,
} from "@/application/atoms/windowAtoms";
import { useOnlineStatus } from "@/application/hooks";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";
import { WindowBase } from "./WindowBase";

// Sound type constants
const CLOSE_SOUND = "window-close";

const OfflineFeatureFallback = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-card p-6 text-card-foreground">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>
      <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700">
        {message}
      </p>
    </div>
  );
};

/**
 * Window Component
 *
 * The main window container that renders all windows in the system using portals.
 * This component is responsible for:
 * - Rendering all managed windows from the windowRegistryAtom state
 * - Creating the portal container if it doesn't exist
 * - Handling window closing with sound effects
 */
const WindowItem = React.memo(function WindowItem({
  windowId,
  onClose,
  onFocus,
}: {
  windowId: string;
  onClose: (windowId: string) => void;
  onFocus: (windowId: string) => void;
}) {
  const { isOnline } = useOnlineStatus();
  const windowAtom = useMemo(
    () => selectAtom(windowRegistryAtom, (registry) => registry[windowId]),
    [windowId]
  );
  const window = useAtomValue(windowAtom);

  if (!window || !window.appId) {
    return null;
  }

  const appConfig = appRegistry[window.appId];
  if (!appConfig) {
    console.error(`App config not found for appId: ${window.appId}`);
    return null;
  }

  const isBlockedOffline = appConfig.onlineOnly && !isOnline;
  const AppComponent = isBlockedOffline ? null : appConfig.component;

  return (
    <WindowBase
      windowId={window.id}
      title={window.title}
      appId={window.appId}
      isOpen={window.isOpen}
      isMinimized={window.isMinimized}
      onClose={() => onClose(window.id)}
      onFocus={() => onFocus(window.id)}
      position={window.position}
      size={window.size}
      minSize={window.minSize}
      zIndex={window.zIndex}
    >
      {isBlockedOffline ? (
        <OfflineFeatureFallback
          title={appConfig.name}
          message={
            appConfig.offlineMessage ||
            "This feature needs an internet connection."
          }
        />
      ) : AppComponent ? (
        <AppComponent />
      ) : null}
    </WindowBase>
  );
});

export const Window = () => {
  // Client-side only state to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // Window state management
  const openWindowIds = useAtomValue(openWindowIdsAtom);
  const closeWindow = useAtom(closeWindowAtom)[1];
  const focusWindow = useAtom(focusWindowAtom)[1];

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);

    let container = document.getElementById("window-portal-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "window-portal-container";
      container.className = "fixed inset-0 z-[100]";
      container.style.pointerEvents = "none";
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);
    }

    setPortalContainer(container);
  }, []);

  const handleCloseWindow = (windowId: string) => {
    playSound("/sounds/close.mp3", CLOSE_SOUND);
    closeWindow(windowId);
  };

  const handleFocusWindow = (windowId: string) => {
    focusWindow(windowId);
  };

  if (!isMounted) return null;

  // If still no portal container, render nothing
  if (!portalContainer) return null;

  // Render all windows through the portal
  return createPortal(
    <>
      {openWindowIds.map((windowId) => (
        <WindowItem
          key={windowId}
          windowId={windowId}
          onClose={handleCloseWindow}
          onFocus={handleFocusWindow}
        />
      ))}
    </>,
    portalContainer
  );
};
