"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DesktopWindow } from "./DesktopWindow";
import { MobileWindow } from "./MobileWindow";
import { useAtom } from "jotai";
import { focusWindowAtom } from "@/application/atoms/windowAtoms";
import { useDeviceDetect } from "@/application/hooks";
import { WindowProvider } from "./WindowProvider";

/**
 * Window Component
 *
 * The main window entry point that adaptively renders either a mobile-optimized
 * or desktop-optimized window based on the device type.
 *
 * Key features:
 * - Uses React Portal to isolate window rendering from the main component tree
 * - Provides WindowProvider context to communicate window state to app components
 * - Prevents unnecessary re-renders of child components
 * - Preserves component state when minimized (no remounting)
 * - Supports responsive design based on device type
 */
type WindowProps = {
  windowId: string;
  appId: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  isMinimized?: boolean;
  onClose: () => void;
  initialSize: { width: number; height: number };
  initialPosition: { x: number; y: number };
  minSize?: { width: number; height: number };
  zIndex: number;
  playSounds?: boolean;
};

export const Window = (props: WindowProps) => {
  const {
    windowId,
    appId,
    isOpen,
    isMinimized = false,
    onClose,
    title,
    children,
    playSounds = true,
    ...restProps
  } = props;

  // Client-side only state to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  const focusWindow = useAtom(focusWindowAtom)[1];

  // Use the hook for device detection
  const { isMobileOrTablet } = useDeviceDetect();

  // Auto-focus the window when it's opened or restored from minimization
  useEffect(() => {
    if (isOpen && !isMinimized) {
      focusWindow(windowId);
    }
  }, [isOpen, isMinimized, windowId, focusWindow]);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Strongly memoize children to prevent rerenders when window state changes
  // This is critical for components like media players
  const memoizedChildren = useMemo(() => {
    // We only memoize the children based on their reference
    return (
      <WindowProvider
        isOpen={isOpen}
        isMinimized={isMinimized}
        onClose={onClose}
      >
        {children}
      </WindowProvider>
    );
  }, [children, isOpen, isMinimized, onClose]);

  // Memoize the window UI separately from its content
  const windowUI = useMemo(() => {
    // Render the appropriate window component based on device type
    return (
      <div style={{ pointerEvents: "auto" }}>
        {isMobileOrTablet ? (
          <MobileWindow
            windowId={windowId}
            appId={appId}
            isOpen={isOpen}
            isMinimized={isMinimized}
            title={title}
            onClose={onClose}
            playSounds={playSounds}
            {...restProps}
          >
            {memoizedChildren}
          </MobileWindow>
        ) : (
          <DesktopWindow
            windowId={windowId}
            appId={appId}
            isOpen={isOpen}
            isMinimized={isMinimized}
            title={title}
            onClose={onClose}
            playSounds={playSounds}
            {...restProps}
          >
            {memoizedChildren}
          </DesktopWindow>
        )}
      </div>
    );
  }, [
    windowId,
    appId,
    isOpen,
    isMinimized,
    title,
    onClose,
    playSounds,
    restProps,
    isMobileOrTablet,
    memoizedChildren,
  ]);

  // Return null if not mounted yet or the window is not open
  if (!isMounted || !isOpen) return null;

  // Find the portal container
  const portalContainer = document.getElementById("window-portal-container");

  // If the portal container doesn't exist, render without the portal
  if (!portalContainer) return windowUI;

  // Render the window through a portal to isolate it from the main component tree
  return createPortal(windowUI, portalContainer);
};
