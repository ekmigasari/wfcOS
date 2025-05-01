"use client";

import React, { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  updateWindowPositionSizeAtom,
  focusWindowAtom,
  setWindowMinimizedStateAtom,
} from "@/application/atoms/windowAtoms";
import { Position, Size } from "@/application/types/window";
import { WindowUI } from "./WindowUI";
import { useDeviceDetect } from "@/application/hooks";
import { playSound, stopSound } from "@/infrastructure/lib/utils";

// Sound type constants
const DRAG_SOUND = "window-drag";
const RESIZE_SOUND = "window-resize";
const MINIMIZE_SOUND = "window-minimize";

export interface WindowBaseProps {
  windowId: string;
  appId: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  isMinimized?: boolean;
  onClose: () => void;
  onFocus: () => void;
  position: Position;
  size: Size;
  minSize?: Size;
  zIndex: number;
  playSounds?: boolean;
}

/**
 * WindowBase Component
 *
 * A unified window implementation that works responsively for both desktop and mobile.
 * Handles all window interactions:
 * - Dragging/moving
 * - Resizing
 * - Minimizing
 * - Closing
 * - Focus management
 */
export const WindowBase = ({
  windowId,
  appId,
  title,
  children,
  isOpen,
  isMinimized = false,
  onClose,
  onFocus,
  position,
  size,
  minSize = { width: 200, height: 150 },
  zIndex,
  playSounds = true,
}: WindowBaseProps) => {
  // Device detection for responsive behavior
  const { isMobileOrTablet } = useDeviceDetect();

  // Window state management atoms
  const updateWindowPositionSize = useAtom(updateWindowPositionSizeAtom)[1];
  const focusWindow = useAtom(focusWindowAtom)[1];
  const [, setWindowMinimizedState] = useAtom(setWindowMinimizedStateAtom);

  // Refs for window dragging and resizing
  const windowRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const currentResizeHandleRef = useRef<string | null>(null);
  const initialSizeRef = useRef<Size>({ width: 0, height: 0 });
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 });

  // Auto-focus when window opens or is restored
  useEffect(() => {
    if (isOpen && !isMinimized) {
      focusWindow(windowId);
    }
  }, [isOpen, isMinimized, windowId, focusWindow]);

  // Handle window dragStart
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (windowRef.current && !isResizingRef.current) {
      // Bring window to front first
      handleFocus();

      isDraggingRef.current = true;

      // Calculate the offset of the mouse from the window origin
      const rect = windowRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Set global cursor to move
      document.body.style.cursor = "move";

      // Play sound if enabled
      if (playSounds) {
        playSound("/sounds/loading.mp3", DRAG_SOUND);
      }

      // Capture mouse events on the entire document
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }
  };

  // Handle window dragging
  const handleDragMove = (e: MouseEvent) => {
    if (isDraggingRef.current && windowRef.current) {
      // Calculate new position based on mouse movement and initial offset
      const newX = Math.max(0, e.clientX - dragOffsetRef.current.x);
      const newY = Math.max(0, e.clientY - dragOffsetRef.current.y);

      // On mobile, constrain window within viewport
      if (isMobileOrTablet) {
        const maxX = window.innerWidth - size.width / 2;
        const maxY = window.innerHeight - 40; // Leave room for window controls
        const constrainedX = Math.min(maxX, newX);
        const constrainedY = Math.min(maxY, newY);

        updateWindowPositionSize({
          id: windowId,
          position: { x: constrainedX, y: constrainedY },
          size,
        });
      } else {
        // Regular desktop behavior
        updateWindowPositionSize({
          id: windowId,
          position: { x: newX, y: newY },
          size,
        });
      }
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDraggingRef.current) return; // Prevent running if not dragging

    isDraggingRef.current = false;

    // Reset global cursor
    document.body.style.cursor = "default";

    // Stop drag sound
    if (playSounds) {
      stopSound(DRAG_SOUND);
    }

    // Remove document-level event listeners
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  };

  // Handle resizing start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (windowRef.current) {
      // Bring window to front
      handleFocus();

      isResizingRef.current = true;
      currentResizeHandleRef.current = handle;

      // Store initial size and position
      initialSizeRef.current = { ...size };
      initialPositionRef.current = { ...position };

      // Calculate initial mouse position
      dragOffsetRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // Play sound if enabled
      if (playSounds) {
        playSound("/sounds/loading.mp3", RESIZE_SOUND);
      }

      // Add document-level event listeners
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }
  };

  // Handle resize movement
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizingRef.current && windowRef.current) {
      const handle = currentResizeHandleRef.current;
      if (!handle) return;

      // Calculate deltas from initial position
      const deltaX = e.clientX - dragOffsetRef.current.x;
      const deltaY = e.clientY - dragOffsetRef.current.y;

      // Get initial values
      const initialWidth = initialSizeRef.current.width;
      const initialHeight = initialSizeRef.current.height;
      const initialX = initialPositionRef.current.x;
      const initialY = initialPositionRef.current.y;

      // Calculate new dimensions
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      // Calculate based on handle direction
      if (handle.includes("right")) {
        newWidth = Math.max(minSize.width, initialWidth + deltaX);
      }
      if (handle.includes("bottom")) {
        newHeight = Math.max(minSize.height, initialHeight + deltaY);
      }
      if (handle.includes("left")) {
        const potentialWidth = Math.max(minSize.width, initialWidth - deltaX);
        if (potentialWidth !== initialWidth) {
          newWidth = potentialWidth;
          newX = initialX + (initialWidth - potentialWidth);
        }
      }
      if (handle.includes("top")) {
        const potentialHeight = Math.max(
          minSize.height,
          initialHeight - deltaY
        );
        if (potentialHeight !== initialHeight) {
          newHeight = potentialHeight;
          newY = initialY + (initialHeight - potentialHeight);
        }
      }

      // Update window position and size
      updateWindowPositionSize({
        id: windowId,
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  // Handle resize end
  const handleResizeEnd = () => {
    isResizingRef.current = false;
    currentResizeHandleRef.current = null;

    // Stop resize sound
    if (playSounds) {
      stopSound(RESIZE_SOUND);
    }

    // Remove document-level event listeners
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Handle window focus
  const handleFocus = () => {
    // Only focus if open and not minimized
    if (isOpen && !isMinimized) {
      focusWindow(windowId);
    }
    // Also call the original onFocus passed from parent if needed
    onFocus(); // Keep this? User might expect it.
  };

  // Handle window minimize
  const handleMinimize = () => {
    if (!isOpen) return; // Can't minimize a closed window
    if (playSounds) {
      playSound("/sounds/minimize.mp3", MINIMIZE_SOUND);
    }
    setWindowMinimizedState({ windowId, isMinimized: true });
  };

  // Early return if the window should not be rendered at all
  if (!isOpen) {
    return null;
  }

  // Apply hidden style if minimized, otherwise null
  const minimizedStyle = isMinimized ? { display: "none" } : {};

  return (
    // Use the minimized style
    <div style={minimizedStyle}>
      <WindowUI
        ref={windowRef}
        windowId={windowId}
        appId={appId}
        title={title}
        position={position}
        size={size}
        zIndex={zIndex}
        isMobile={isMobileOrTablet}
        onTitleBarMouseDown={handleDragStart}
        onMinimize={handleMinimize}
        onClose={onClose} // Pass original onClose
        onFocus={handleFocus}
        onResizeStart={handleResizeStart}
      >
        {/* Render children directly, WindowProvider is removed */}
        {children}
      </WindowUI>
    </div>
  );
};
