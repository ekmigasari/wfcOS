"use client";

import React from "react";
import { cn } from "../../../../infrastructure/lib/utils";

/**
 * WindowBase Component
 *
 * A base component for window UI that provides the foundation for both desktop and mobile window implementations.
 * This component handles the basic window structure with title bar and content area,
 * but delegates device-specific behaviors to specialized implementations.
 *
 * The component accepts common window properties like position, size, and styling options,
 * while providing extension points for specialized behaviors like dragging and resizing.
 *
 * For now it only use at mobile window
 */
export type WindowBaseProps = {
  windowId: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onFocus: () => void;
  className?: string;
  titleBarClassName?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  onTitleBarMouseDown?: (event: React.MouseEvent<Element, MouseEvent>) => void;
};

export const WindowBase = ({
  // windowId not used in base component but kept in type for consistency
  title,
  children,
  isOpen,
  onClose,
  onMinimize,
  zIndex,
  position,
  size,
  onFocus,
  className = "",
  titleBarClassName = "",
  contentClassName = "",
  style = {},
  onTitleBarMouseDown,
}: WindowBaseProps) => {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

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
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimize"
          >
            -
          </button>
          <button
            className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold leading-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
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
    </div>
  );
};
