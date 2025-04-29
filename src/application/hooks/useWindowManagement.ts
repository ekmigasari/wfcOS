"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Position, Size } from "@/application/types/window";
import { playSound } from "@/infrastructure/lib/utils";

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
  windowId: string;
  initialPosition: Position;
  initialSize: Size;
  minSize?: Size;
  containerRef?: React.RefObject<HTMLElement>;
  onInteractionEnd: (id: string, newPosition: Position, newSize: Size) => void;
  onFocus: (id: string) => void;
}

export const useWindowManagement = ({
  windowId,
  initialPosition,
  initialSize,
  minSize,
  containerRef,
  onInteractionEnd,
  onFocus,
}: UseWindowManagementProps) => {
  // Initialize state directly from props
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] =
    useState<ResizeDirection | null>(null);

  // Refs to store starting values during interactions
  const startPositionRef = useRef<Position>({ x: 0, y: 0 });
  const startSizeRef = useRef<Size>({ width: 0, height: 0 });
  const startMousePositionRef = useRef<Position>({ x: 0, y: 0 });

  // Ref to store the currently playing sound instance
  const activeSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Drag Logic ---
  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).dataset.resizeHandle) return;
      onFocus(windowId);
      activeSoundRef.current?.pause();
      activeSoundRef.current = playSound("/sounds/loading.mp3");
      setIsDragging(true);
      setIsResizing(false);
      startPositionRef.current = { ...position };
      startMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    },
    [position, windowId, onFocus]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startMousePositionRef.current.x;
      const deltaY = e.clientY - startMousePositionRef.current.y;
      let newX = startPositionRef.current.x + deltaX;
      let newY = startPositionRef.current.y + deltaY;
      const currentSize = size;
      if (containerRef?.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        newX = Math.max(
          0,
          Math.min(newX, parentRect.width - currentSize.width)
        );
        newY = Math.max(
          0,
          Math.min(newY, parentRect.height - currentSize.height)
        );
      } else {
        newX = Math.max(
          0,
          Math.min(newX, window.innerWidth - currentSize.width)
        );
        newY = Math.max(
          0,
          Math.min(newY, window.innerHeight - currentSize.height)
        );
      }
      setPosition({ x: newX, y: newY });
    },
    [isDragging, size, containerRef]
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (activeSoundRef.current) {
        activeSoundRef.current.pause();
        activeSoundRef.current.currentTime = 0;
        activeSoundRef.current = null;
      }
      onInteractionEnd(windowId, position, size);
    }
  }, [isDragging, windowId, position, size, onInteractionEnd]);

  // --- Resize Logic ---
  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, direction: ResizeDirection) => {
      onFocus(windowId);
      activeSoundRef.current?.pause();
      activeSoundRef.current = playSound("/sounds/loading.mp3");
      setIsResizing(true);
      setIsDragging(false);
      setResizeDirection(direction);
      startPositionRef.current = { ...position };
      startSizeRef.current = { ...size };
      startMousePositionRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation();
    },
    [position, size, windowId, onFocus]
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
      const effectiveMinSize = {
        width: minSize?.width ?? 150,
        height: minSize?.height ?? 100,
      };
      if (resizeDirection.includes("right")) {
        newWidth = Math.max(
          effectiveMinSize.width,
          startSizeRef.current.width + deltaX
        );
      }
      if (resizeDirection.includes("bottom")) {
        newHeight = Math.max(
          effectiveMinSize.height,
          startSizeRef.current.height + deltaY
        );
      }
      if (resizeDirection.includes("left")) {
        const widthChange = Math.min(
          deltaX,
          startSizeRef.current.width - effectiveMinSize.width
        );
        newWidth = startSizeRef.current.width - widthChange;
        newX = startPositionRef.current.x + widthChange;
      }
      if (resizeDirection.includes("top")) {
        const heightChange = Math.min(
          deltaY,
          startSizeRef.current.height - effectiveMinSize.height
        );
        newHeight = startSizeRef.current.height - heightChange;
        newY = startPositionRef.current.y + heightChange;
      }
      if (containerRef?.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        newWidth = Math.min(newWidth, parentRect.width - newX);
        newHeight = Math.min(newHeight, parentRect.height - newY);
        newX = Math.max(0, Math.min(newX, parentRect.width - newWidth));
        newY = Math.max(0, Math.min(newY, parentRect.height - newHeight));
      } else {
        newWidth = Math.min(newWidth, window.innerWidth - newX);
        newHeight = Math.min(newHeight, window.innerHeight - newY);
        newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));
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
      if (activeSoundRef.current) {
        activeSoundRef.current.pause();
        activeSoundRef.current.currentTime = 0;
        activeSoundRef.current = null;
      }
      onInteractionEnd(windowId, position, size);
    }
  }, [isResizing, windowId, position, size, onInteractionEnd]);

  // --- Global Event Listeners ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDragMove(e);
      if (isResizing) handleResizeMove(e);
    };
    const handleMouseUp = () => {
      if (isDragging) handleDragEnd();
      if (isResizing) handleResizeEnd();
    };
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
