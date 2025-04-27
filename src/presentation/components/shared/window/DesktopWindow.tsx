"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useWindowManagement } from "../../../../application/hooks/useWindowManagement";
import {
  focusWindowAtom,
  updateWindowPositionSizeAtom,
  minimizeWindowAtom,
} from "../../../../application/atoms/windowAtoms";
import { playSound } from "../../../../infrastructure/lib/utils";
import { WindowBase } from "./WindowBase";

/**
 * DesktopWindow Component
 *
 * A specialized window implementation for desktop interfaces that extends the base window
 * with additional desktop-specific functionality:
 *
 * - Draggable window (via title bar)
 * - Resizable from edges and corners
 * - Size constraints with minimum dimensions
 * - Focus management
 * - Window minimization support
 *
 * Uses the useWindowManagement hook to handle drag and resize operations,
 * and integrates with Jotai global state for position, size, and focus tracking.
 */
type DesktopWindowProps = {
  windowId: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  initialSize: { width: number; height: number };
  initialPosition: { x: number; y: number };
  minSize?: { width: number; height: number };
  zIndex: number;
};

export const DesktopWindow = ({
  windowId,
  title,
  children,
  isOpen,
  onClose,
  initialSize,
  initialPosition,
  minSize = { width: 150, height: 100 },
  zIndex,
}: DesktopWindowProps) => {
  // Client-side only state to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

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
    playSound("/sounds/minimize.mp3");
    minimizeWindow(windowId);
  };

  // Handle window close
  const handleClose = () => {
    playSound("/sounds/close.mp3");
    onClose();
  };

  // Callback for updating position and size in global state
  const handleInteractionEnd = (
    id: string,
    newPosition: { x: number; y: number },
    newSize: { width: number; height: number }
  ) => {
    updateWindowPositionSize({ id, position: newPosition, size: newSize });
  };

  // Use the window management hook for drag and resize functionality
  const { position, size, handleDragStart, handleResizeStart } =
    useWindowManagement({
      windowId,
      initialSize,
      initialPosition,
      minSize,
      onInteractionEnd: handleInteractionEnd,
      onFocus: handleFocus,
    });

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !isOpen) {
    return null;
  }

  const onTitleBarMouseDown = (
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    // This wrapper function bridges the type gap
    handleDragStart(event as React.MouseEvent<HTMLDivElement>);
  };

  return (
    <WindowBase
      windowId={windowId}
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      onMinimize={handleMinimize}
      zIndex={zIndex}
      position={position}
      size={size}
      onFocus={handleFocus}
      onTitleBarMouseDown={onTitleBarMouseDown}
      minSize={minSize}
      handleResizeStart={handleResizeStart}
      showResizeHandles={true}
      titleBarClassName="cursor-move"
    >
      {children}
    </WindowBase>
  );
};
