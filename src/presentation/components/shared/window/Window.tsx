"use client";

import React, { useEffect } from "react";
import { DesktopWindow } from "./DesktopWindow";
import { MobileWindow } from "./MobileWindow";
import { useAtom } from "jotai";
import { focusWindowAtom } from "@/application/atoms/windowAtoms";
import { useDeviceDetect } from "@/application/hooks";
import {
  setTimerWindowIdAtom,
  handleTimerWindowCloseAtom,
} from "@/application/atoms/timerAtom";

/**
 * Window Component
 *
 * The main window entry point that adaptively renders either a mobile-optimized
 * or desktop-optimized window based on the device type.
 *
 * This component follows the strategy pattern by delegating to specialized
 * implementations (DesktopWindow or MobileWindow) based on the device context,
 * promoting better code organization and separation of concerns.
 *
 * Each specialized implementation shares common base UI elements from WindowBase
 * but implements its own device-specific behaviors and optimizations.
 *
 * Features:
 * - Responsive design based on device type (auto-detected)
 * - Window dragging (desktop only)
 * - Window resizing (desktop only)
 * - Window minimization (both desktop and mobile)
 * - Focus management
 * - Automatic focus when opened from icon clicks
 * - Preserves component state when minimized (no remounting)
 */
type WindowProps = {
  windowId: string;
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
    isOpen,
    isMinimized,
    onClose,
    title,
    playSounds = true,
    ...restProps
  } = props;
  const focusWindow = useAtom(focusWindowAtom)[1];
  const setTimerWindowId = useAtom(setTimerWindowIdAtom)[1];
  const handleTimerWindowClose = useAtom(handleTimerWindowCloseAtom)[1];

  // Use the new hook instead of requiring isMobileOrTablet as a prop
  const { isMobileOrTablet } = useDeviceDetect();

  // Determine if this is a timer window by checking the title
  const isTimerWindow = title.toLowerCase().includes("timer");

  // Handle window open/close for timer persistence
  useEffect(() => {
    if (isOpen && isTimerWindow) {
      // When timer window opens, associate it with the timer
      setTimerWindowId(windowId);
    }

    // Cleanup function for when window closes or component unmounts
    return () => {
      if (isTimerWindow && !isOpen) {
        // Reset timer when timer window is closed
        handleTimerWindowClose();
      }
    };
  }, [
    isOpen,
    windowId,
    isTimerWindow,
    setTimerWindowId,
    handleTimerWindowClose,
  ]);

  // Auto-focus the window when it's opened or restored from minimization
  useEffect(() => {
    if (isOpen && !isMinimized) {
      focusWindow(windowId);
    }
  }, [isOpen, isMinimized, windowId, focusWindow]);

  // Custom close handler that integrates with timer
  const handleClose = () => {
    if (isTimerWindow) {
      // Handle timer cleanup when window is closed
      handleTimerWindowClose();
    }

    // Call the original onClose handler
    onClose();
  };

  // If window is not open, don't render anything
  if (!isOpen) return null;

  // Render the appropriate window component based on device type
  // Note: We always render the component even when minimized to preserve state
  return isMobileOrTablet ? (
    <MobileWindow
      windowId={windowId}
      isOpen={isOpen}
      isMinimized={isMinimized}
      title={title}
      onClose={handleClose}
      playSounds={playSounds}
      {...restProps}
    />
  ) : (
    <DesktopWindow
      windowId={windowId}
      isOpen={isOpen}
      isMinimized={isMinimized}
      title={title}
      onClose={handleClose}
      playSounds={playSounds}
      {...restProps}
    />
  );
};
