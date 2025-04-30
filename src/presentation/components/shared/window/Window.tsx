"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAtom } from "jotai";
import {
  openWindowsAtom,
  closeWindowAtom,
  focusWindowAtom,
} from "@/application/atoms/windowAtoms";
import { WindowBase } from "./WindowBase";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";

// Sound type constants
const CLOSE_SOUND = "window-close";

/**
 * Window Component
 *
 * The main window container that renders all windows in the system using portals.
 * This component is responsible for:
 * - Rendering all open windows from the windowAtoms state
 * - Creating the portal container if it doesn't exist
 * - Handling window closing with sound effects
 */
export const Window = () => {
  // Client-side only state to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  // Window state management
  const [openWindows] = useAtom(openWindowsAtom);
  const closeWindow = useAtom(closeWindowAtom)[1];
  const focusWindow = useAtom(focusWindowAtom)[1];

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCloseWindow = (windowId: string) => {
    playSound("/sounds/close.mp3", CLOSE_SOUND);
    closeWindow(windowId);
  };

  const handleFocusWindow = (windowId: string) => {
    focusWindow(windowId);
  };

  if (!isMounted) return null;

  // Create portal container if it doesn't exist
  let portalContainer = document.getElementById("window-portal-container");
  if (!portalContainer && typeof document !== "undefined") {
    portalContainer = document.createElement("div");
    portalContainer.id = "window-portal-container";
    portalContainer.className = "fixed inset-0 z-[100]";
    portalContainer.style.pointerEvents = "none";
    portalContainer.setAttribute("aria-hidden", "true");
    document.body.appendChild(portalContainer);
  }

  // If still no portal container, render nothing
  if (!portalContainer) return null;

  // Render all windows through the portal
  return createPortal(
    <>
      {openWindows.map((window) => {
        // Skip invalid window data
        if (!window || !window.appId) {
          console.error("Window data is incomplete:", window);
          return null;
        }

        // Find app configuration
        const appConfig = appRegistry[window.appId];
        if (!appConfig) {
          console.error(`App config not found for appId: ${window.appId}`);
          return null;
        }

        // Get app component
        const AppComponent = appConfig.component;
        if (!AppComponent) {
          console.error(`Component not found for appId: ${window.appId}`);
          return null;
        }

        return (
          <WindowBase
            key={window.id}
            windowId={window.id}
            title={window.title}
            appId={window.appId}
            isOpen={true}
            isMinimized={window.isMinimized}
            onClose={() => handleCloseWindow(window.id)}
            onFocus={() => handleFocusWindow(window.id)}
            position={window.position}
            size={window.size}
            minSize={window.minSize}
            zIndex={window.zIndex}
          >
            <AppComponent />
          </WindowBase>
        );
      })}
    </>,
    portalContainer
  );
};
