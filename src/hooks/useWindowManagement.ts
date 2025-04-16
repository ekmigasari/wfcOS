"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Position, Size } from "../types";

// Define possible resize directions
export type ResizeDirection =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "right"
  | "left"
  | "top"
  | "bottom";

interface UseWindowManagementProps {
  initialPosition?: Position;
  initialSize: Size;
  minSize?: Size; // Optional minimum size
  containerRef?: React.RefObject<HTMLElement>;
}

export const useWindowManagement = ({
  initialPosition,
  initialSize,
  minSize = { width: 150, height: 100 }, // Default minimum size
  containerRef,
}: UseWindowManagementProps) => {
  const getDefaultPosition = (size: Size): Position => {
    const parentWidth = containerRef?.current?.clientWidth ?? window.innerWidth;
    const parentHeight =
      containerRef?.current?.clientHeight ?? window.innerHeight;
    return {
      x: Math.max(0, (parentWidth - size.width) / 2), // Ensure initial position is non-negative
      y: Math.max(0, (parentHeight - size.height) / 2),
    };
  };

  const [position, setPosition] = useState<Position>(
    initialPosition ?? getDefaultPosition(initialSize)
  );
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] =
    useState<ResizeDirection | null>(null);

  // Refs to store starting values during interactions
  const startPositionRef = useRef<Position>({ x: 0, y: 0 });
  const startSizeRef = useRef<Size>({ width: 0, height: 0 });
  const startMousePositionRef = useRef<Position>({ x: 0, y: 0 });

  // --- Drag Logic ---
  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent starting drag if clicking on a resize handle (if nested)
      if ((e.target as HTMLElement).dataset.resizeHandle) return;

      setIsDragging(true);
      setIsResizing(false); // Ensure not resizing
      startPositionRef.current = { ...position };
      startMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    },
    [position]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startMousePositionRef.current.x;
      const deltaY = e.clientY - startMousePositionRef.current.y;

      let newX = startPositionRef.current.x + deltaX;
      let newY = startPositionRef.current.y + deltaY;

      // Constrain movement
      if (containerRef?.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, parentRect.width - size.width));
        newY = Math.max(0, Math.min(newY, parentRect.height - size.height));
      } else {
        newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - size.height));
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging, size.width, size.height, containerRef]
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // --- Resize Logic ---
  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, direction: ResizeDirection) => {
      setIsResizing(true);
      setIsDragging(false); // Ensure not dragging
      setResizeDirection(direction);
      startPositionRef.current = { ...position };
      startSizeRef.current = { ...size };
      startMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation(); // Prevent drag start on title bar if handle overlaps
    },
    [position, size]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return;

      const currentMousePos = { x: e.clientX, y: e.clientY };
      const deltaX = currentMousePos.x - startMousePositionRef.current.x;
      const deltaY = currentMousePos.y - startMousePositionRef.current.y;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      let newX = startPositionRef.current.x;
      let newY = startPositionRef.current.y;

      // Calculate new dimensions and position based on direction
      if (resizeDirection.includes("right")) {
        newWidth = Math.max(minSize.width, startSizeRef.current.width + deltaX);
      }
      if (resizeDirection.includes("bottom")) {
        newHeight = Math.max(
          minSize.height,
          startSizeRef.current.height + deltaY
        );
      }
      if (resizeDirection.includes("left")) {
        newWidth = Math.max(minSize.width, startSizeRef.current.width - deltaX);
        newX = startPositionRef.current.x + deltaX; // Adjust position
        // Prevent width becoming too small while moving left edge
        if (newWidth === minSize.width) {
          newX =
            startPositionRef.current.x +
            (startSizeRef.current.width - minSize.width);
        }
      }
      if (resizeDirection.includes("top")) {
        newHeight = Math.max(
          minSize.height,
          startSizeRef.current.height - deltaY
        );
        newY = startPositionRef.current.y + deltaY; // Adjust position
        // Prevent height becoming too small while moving top edge
        if (newHeight === minSize.height) {
          newY =
            startPositionRef.current.y +
            (startSizeRef.current.height - minSize.height);
        }
      }

      // Apply bounds checks for position if container exists
      if (containerRef?.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, parentRect.width - newWidth));
        newY = Math.max(0, Math.min(newY, parentRect.height - newHeight));
      } else {
        newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));
      }

      // Check bounds for size relative to container (if applicable)
      if (containerRef?.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        newWidth = Math.min(newWidth, parentRect.width - newX);
        newHeight = Math.min(newHeight, parentRect.height - newY);
      } else {
        newWidth = Math.min(newWidth, window.innerWidth - newX);
        newHeight = Math.min(newHeight, window.innerHeight - newY);
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    },
    [isResizing, resizeDirection, minSize, containerRef]
  );

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
    }
  }, [isResizing]);

  // --- Global Event Listeners ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDragMove(e);
      if (isResizing) handleResizeMove(e);
    };

    const handleMouseUp = () => {
      handleDragEnd();
      handleResizeEnd();
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      // Consider adding touch event listeners here as well for mobile
      // window.addEventListener('touchmove', handleTouchMove);
      // window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // window.removeEventListener('touchmove', handleTouchMove);
      // window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    isDragging,
    isResizing,
    handleDragMove,
    handleDragEnd,
    handleResizeMove,
    handleResizeEnd,
  ]);

  return {
    position,
    size,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
  };
};
