"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAtom } from "jotai";
import { WindowBase } from "./WindowBase";
import {
  focusWindowAtom,
  updateWindowPositionSizeAtom,
  minimizeWindowAtom,
} from "../../../../application/atoms/windowAtoms";

/**
 * MobileWindow Component
 *
 * A specialized window implementation optimized for mobile and tablet devices.
 * Unlike the desktop version, this window:
 *
 * - Has fixed positioning (non-draggable)
 * - Automatically adjusts to device screen size
 * - Uses mobile-optimized styling with larger touch targets
 * - Lacks resize functionality for better mobile UX
 * - Supports window minimization
 *
 * The component recalculates its size on window resize to ensure
 * proper display across various mobile device orientations and sizes.
 */
type MobileWindowProps = {
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
  onMinimizeStateChange?: (isMinimized: boolean) => void;
};

export const MobileWindow = ({
  windowId,
  title,
  children,
  isOpen,
  isMinimized = false,
  onClose,
  zIndex,
  playSounds = true,
  onMinimizeStateChange,
}: MobileWindowProps) => {
  // Client-side only state to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  // State to store window dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Jotai state management
  const focusWindow = useAtom(focusWindowAtom)[1];
  const updateWindowPositionSize = useAtom(updateWindowPositionSizeAtom)[1];
  const minimizeWindow = useAtom(minimizeWindowAtom)[1];

  // Handle window focus
  const handleFocus = () => {
    focusWindow(windowId);
  };

  // Handle window minimize
  const handleMinimize = () => {
    minimizeWindow(windowId);
  };

  // Handle window close
  const handleClose = () => {
    onClose();
  };

  // Effect to update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate position and size for mobile using useMemo
  const mobilePosition = useMemo(
    () => ({
      x: 0, // Fixed position at left
      y: 36 + 4, // Menubar height (36px) + 4px gap
    }),
    []
  );

  const mobileSize = useMemo(
    () => ({
      width: windowDimensions.width - 2 * 16, // Full width minus padding
      height: Math.min(
        windowDimensions.height * 0.8,
        windowDimensions.height - (36 + 4 + 16) // Account for menubar + gap + bottom padding
      ),
    }),
    [windowDimensions.width, windowDimensions.height]
  );

  // Report position and size changes to global state when window is shown
  useEffect(() => {
    if (isOpen && isMounted) {
      updateWindowPositionSize({
        id: windowId,
        position: mobilePosition,
        size: mobileSize,
      });
    }
  }, [
    isOpen,
    isMounted,
    windowId,
    updateWindowPositionSize,
    mobilePosition,
    mobileSize,
  ]);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Mobile-specific styling
  const mobileStyle = {
    borderRadius: "0.375rem", // Match menubar's rounded-md
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    transition: "all 0.2s ease-in-out",
    border: "2px solid var(--secondary)", // Match menubar border
  };

  return (
    <WindowBase
      windowId={windowId}
      title={title}
      isOpen={isOpen}
      isMinimized={isMinimized}
      onClose={handleClose}
      onMinimize={handleMinimize}
      zIndex={zIndex}
      position={mobilePosition}
      size={mobileSize}
      onFocus={handleFocus}
      className="mobile-window"
      titleBarClassName="mobile-title-bar px-4 bg-primary rounded-t-[0.375rem]"
      contentClassName="mobile-content px-4"
      style={mobileStyle}
      showResizeHandles={false} // Mobile doesn't use resize handles
      playSounds={playSounds}
      onMinimizeStateChange={onMinimizeStateChange}
    >
      {children}
    </WindowBase>
  );
};
