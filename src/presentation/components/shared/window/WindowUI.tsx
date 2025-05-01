"use client";

import React, { forwardRef, memo, useMemo } from "react";
import { cn } from "@/infrastructure/lib/utils";

export interface WindowUIProps {
  windowId: string;
  appId: string;
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMobile: boolean;
  onTitleBarMouseDown: (e: React.MouseEvent) => void;
  onMinimize: () => void;
  onClose: () => void;
  onFocus: () => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

/**
 * WindowUI Component
 *
 * Pure UI component for rendering window visuals with:
 * - Title bar with window controls (minimize/close)
 * - Content area with children
 * - Resize handles
 *
 * This component is memoized to prevent unnecessary re-renders.
 */
export const WindowUI = memo(
  forwardRef<HTMLDivElement, WindowUIProps>(
    (
      {
        windowId,
        appId,
        title,
        children,
        position,
        size,
        zIndex,
        isMobile,
        onTitleBarMouseDown,
        onMinimize,
        onClose,
        onFocus,
        onResizeStart,
      },
      ref
    ) => {
      // Define resize handle classes and styles
      const handleBaseClass = "absolute z-[1001] select-none";
      const cornerHandleClass = `${handleBaseClass} w-5 h-5`;
      const edgeHandleClass = handleBaseClass;

      // Define resize handles with useMemo to prevent unnecessary recalculations
      const resizeHandles = useMemo(
        () => [
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
            className: cn(
              edgeHandleClass,
              "top-5 bottom-5 right-[-3px] w-[6px]"
            ),
            direction: "right",
            style: { cursor: "ew-resize" },
          },
          {
            className: cn(
              edgeHandleClass,
              "top-5 bottom-5 left-[-3px] w-[6px]"
            ),
            direction: "left",
            style: { cursor: "ew-resize" },
          },
          {
            className: cn(
              edgeHandleClass,
              "left-5 right-5 bottom-[-3px] h-[6px]"
            ),
            direction: "bottom",
            style: { cursor: "ns-resize" },
          },
          {
            className: cn(edgeHandleClass, "left-5 right-5 top-[-3px] h-[6px]"),
            direction: "top",
            style: { cursor: "ns-resize" },
          },
        ],
        [cornerHandleClass, edgeHandleClass]
      );

      // Memoize window style to prevent recalculations
      const windowStyle = useMemo(
        () => ({
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: "150px",
          minHeight: "100px",
          zIndex: zIndex,
          position: "absolute" as const,
          pointerEvents: "auto" as const,
        }),
        [position.x, position.y, size.width, size.height, zIndex]
      );

      // Calculate additional classes for mobile
      const windowClass = useMemo(
        () =>
          cn(
            "absolute bg-background border border-secondary rounded-lg shadow-xl flex flex-col overflow-hidden",
            isMobile && "max-w-screen"
          ),
        [isMobile]
      );

      return (
        <div
          ref={ref}
          id={`window-${windowId}`}
          data-app-id={appId}
          className={windowClass}
          style={windowStyle}
          onMouseDown={onFocus}
        >
          {/* Title Bar */}
          <div
            className="bg-primary px-3 py-2 border-b border-secondary flex justify-between items-center select-none h-10 rounded-t-md shadow-md"
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
                  onFocus();
                  onMinimize();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Minimize"
              >
                -
              </button>
              <button
                className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onFocus();
                  onClose();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Close"
              >
                X
              </button>
            </div>
          </div>

          {/* Memoized Content Area */}
          <div className="p-4 flex-grow overflow-auto bg-card">{children}</div>

          {/* Resize Handles */}
          {!isMobile &&
            resizeHandles.map((handle) => (
              <div
                key={handle.direction}
                className={handle.className}
                style={handle.style}
                data-resize-handle={handle.direction}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e, handle.direction);
                }}
              />
            ))}
        </div>
      );
    }
  )
);

WindowUI.displayName = "WindowUI";
