"use client";

import React from "react";
import { cn, playSound } from "../../../../infrastructure/lib/utils";
import { ResizeDirection } from "../../../../application/hooks/useWindowManagement";
import { useAtom } from "jotai";
import { setWindowMinimizedStateAtom } from "../../../../application/atoms/windowAtoms";

/**
 * WindowBase Component
 *
 * A base component for window UI that provides the foundation for both desktop and mobile window implementations.
 * This component handles the basic window structure with title bar and content area,
 * with support for common window operations including resizing.
 *
 * The component accepts common window properties like position, size, and styling options,
 * while providing extension points for specialized behaviors like dragging and resizing.
 *
 */
export type WindowBaseProps = {
  windowId: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  isMinimized?: boolean;
  onClose: () => void;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onFocus: () => void;
  className?: string;
  titleBarClassName?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  onTitleBarMouseDown?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  minSize?: { width: number; height: number };
  handleResizeStart?: (
    e: React.MouseEvent<HTMLDivElement>,
    direction: ResizeDirection
  ) => void;
  showResizeHandles?: boolean;
  playSounds?: boolean;
};

export const WindowBase = ({
  windowId,
  title,
  children,
  isOpen,
  isMinimized = false,
  onClose,
  zIndex,
  position,
  size,
  onFocus,
  className = "",
  titleBarClassName = "",
  contentClassName = "",
  style = {},
  onTitleBarMouseDown,
  minSize = { width: 150, height: 100 },
  handleResizeStart,
  showResizeHandles = false,
  playSounds = true,
}: WindowBaseProps) => {
  // Jotai atom for minimizing windows
  const [, setWindowMinimizedState] = useAtom(setWindowMinimizedStateAtom);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Handle window close with sound
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playSounds) {
      playSound("/sounds/close.mp3");
    }
    onClose();
  };

  // Handle window minimize request with sound
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playSounds) {
      playSound("/sounds/minimize.mp3");
    }
    setWindowMinimizedState({ windowId, isMinimized: true });
  };

  // Define resize handles for window
  const handleBaseClass = "absolute z-[1001] select-none";
  const cornerHandleClass = `${handleBaseClass} w-5 h-5`;
  const edgeHandleClass = handleBaseClass;

  // Skip rendering the visible part if minimized
  if (isMinimized) {
    return (
      <div
        className="absolute opacity-0 pointer-events-none"
        style={{
          position: "fixed", // Fixed position to ensure it stays in viewport
          left: "-9999px", // Move it off-screen
          top: 0,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: -1, // Keep it in the background
          visibility: "hidden", // Hide it from view
          // But don't use display: none as it would stop audio
        }}
        aria-hidden="true" // For accessibility
      >
        {/* Still render the children so media keeps playing */}
        {children}
      </div>
    );
  }

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
      className={cn(
        "absolute bg-background border border-secondary rounded-lg shadow-xl flex flex-col overflow-hidden",
        className
      )}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: minSize?.width ? `${minSize.width}px` : "150px",
        minHeight: minSize?.height ? `${minSize.height}px` : "100px",
        zIndex,
        ...style,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={cn(
          "bg-primary px-3 py-2 border-b border-secondary flex justify-between items-center select-none h-10 rounded-t-md shadow-md",
          titleBarClassName
        )}
        onMouseDown={onTitleBarMouseDown}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-white">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="cursor-pointer bg-yellow-500 text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
            onClick={handleMinimize}
            title="Minimize"
          >
            -
          </button>
          <button
            className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
            onClick={handleClose}
            title="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={cn("p-4 flex-grow overflow-auto bg-card", contentClassName)}
      >
        {children}
      </div>

      {/* Resize Handles */}
      {showResizeHandles &&
        handleResizeStart &&
        resizeHandles.map((handle) => (
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
