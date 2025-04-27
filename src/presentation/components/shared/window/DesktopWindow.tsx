"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { cn } from "../../../../infrastructure/lib/utils";
import {
  useWindowManagement,
  ResizeDirection,
} from "../../../../application/hooks/useWindowManagement";
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

  // Define resize handles for desktop window
  const handleBaseClass = "absolute z-[1001] select-none";
  const cornerHandleClass = `${handleBaseClass} w-5 h-5`;
  const edgeHandleClass = handleBaseClass;

  const resizeHandles: {
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

  return (
    <div
      className="absolute bg-background border border-secondary rounded-lg shadow-xl flex flex-col overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: minSize?.width ? `${minSize.width}px` : "150px",
        minHeight: minSize?.height ? `${minSize.height}px` : "100px",
        zIndex,
      }}
      onMouseDown={handleFocus}
    >
      {/* Title Bar */}
      <div
        className="bg-primary px-3 py-2 border-b border-secondary flex justify-between items-center select-none h-10 rounded-t-md shadow-md cursor-move"
        onMouseDown={onTitleBarMouseDown}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-white">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="cursor-pointer bg-yellow-500 text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            title="Minimize"
          >
            -
          </button>
          <button
            className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            title="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-grow overflow-auto bg-card">{children}</div>

      {/* Resize Handles */}
      {resizeHandles.map((handle) => (
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
      ))}
    </div>
  );
};
