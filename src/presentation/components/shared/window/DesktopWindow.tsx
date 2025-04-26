"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { cn } from "../../../../infrastructure/lib/utils";
import { WindowBase } from "./WindowBase";
import {
  useWindowManagement,
  ResizeDirection,
} from "../../../../hooks/useWindowManagement";
import {
  focusWindowAtom,
  updateWindowPositionSizeAtom,
  minimizeWindowAtom,
} from "../../../../application/atoms/windowAtoms";
import { playSound } from "../../../../infrastructure/lib/utils";

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

  // Define resize handles for desktop window
  const renderResizeHandles = () => {
    const handleBaseClass = "absolute z-[1001] select-none";
    const cornerHandleClass = `${handleBaseClass} w-5 h-5`;
    const edgeHandleClass = handleBaseClass;

    const handles: {
      className: string;
      direction: ResizeDirection;
      style?: React.CSSProperties;
    }[] = [
      // Corners
      {
        className: cn(cornerHandleClass, "bottom-[-3px] right-[-3px]"),
        direction: "bottom-right",
        style: {
          cursor: "nwse-resize",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
      {
        className: cn(cornerHandleClass, "bottom-[-3px] left-[-3px]"),
        direction: "bottom-left",
        style: {
          cursor: "nesw-resize",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
      {
        className: cn(cornerHandleClass, "top-[-3px] right-[-3px]"),
        direction: "top-right",
        style: {
          cursor: "nesw-resize",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
      {
        className: cn(cornerHandleClass, "top-[-3px] left-[-3px]"),
        direction: "top-left",
        style: {
          cursor: "nwse-resize",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
      // Edges
      {
        className: cn(edgeHandleClass, "top-5 bottom-5 right-[-3px] w-[6px]"),
        direction: "right",
        style: { cursor: "ew-resize" },
      },
      {
        className: cn(edgeHandleClass, "top-5 bottom-5 left-[-3px] w-[6px]"),
        direction: "left",
        style: { cursor: "ew-resize" },
      },
      {
        className: cn(edgeHandleClass, "left-5 right-5 bottom-[-3px] h-[6px]"),
        direction: "bottom",
        style: { cursor: "ns-resize" },
      },
      {
        className: cn(edgeHandleClass, "left-5 right-5 top-[-3px] h-[6px]"),
        direction: "top",
        style: { cursor: "ns-resize" },
      },
    ];

    return handles.map((handle) => (
      <div
        key={handle.direction}
        className={handle.className}
        style={handle.style}
        data-resize-handle="true"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e, handle.direction);
        }}
      />
    ));
  };

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  const onTitleBarMouseDown = (
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    // This wrapper function bridges the type gap
    handleDragStart(event as React.MouseEvent<HTMLDivElement>);
  };

  return (
    <>
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
        style={{
          minWidth: minSize?.width ? `${minSize.width}px` : "150px",
          minHeight: minSize?.height ? `${minSize.height}px` : "100px",
        }}
        titleBarClassName="cursor-move"
        onTitleBarMouseDown={onTitleBarMouseDown}
      >
        {children}
      </WindowBase>
      {isOpen && renderResizeHandles()}
    </>
  );
};
