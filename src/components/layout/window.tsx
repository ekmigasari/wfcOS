import React from "react";
import {
  useWindowManagement,
  ResizeDirection,
} from "../../hooks/useWindowManagement"; // Import ResizeDirection
import { Size } from "../../types"; // Updated path
import { cn } from "../../lib/utils"; // Import cn utility if available

interface WindowProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  defaultSize: Size; // Add defaultSize prop
  minSize?: Size;
  // Add initialPosition prop if needed
}

const Window: React.FC<WindowProps> = ({
  title,
  children,
  isOpen,
  onClose,
  defaultSize,
  minSize, // Pass minSize to the hook
}) => {
  const {
    position,
    size,
    handleDragStart,
    handleResizeStart, // Get resize handler
  } = useWindowManagement({ initialSize: defaultSize, minSize }); // Pass minSize

  if (!isOpen) {
    return null;
  }

  // --- Resize Handle Base Class ---
  const handleBaseClass = "absolute z-[1001] select-none";

  // --- Resize Handle Specific Classes ---
  const cornerHandleClass = `${handleBaseClass} w-3 h-3`; // Use w-3 h-3 for 12px
  const edgeHandleClass = handleBaseClass;

  // Specific handle positions and cursors using Tailwind classes
  const handles: {
    className: string;
    direction: ResizeDirection;
    style?: React.CSSProperties;
  }[] = [
    // Corners
    {
      className: cn(
        cornerHandleClass,
        "bottom-[-6px] right-[-6px] cursor-nwse-resize"
      ),
      direction: "bottom-right",
    },
    {
      className: cn(
        cornerHandleClass,
        "bottom-[-6px] left-[-6px] cursor-nesw-resize"
      ),
      direction: "bottom-left",
    },
    {
      className: cn(
        cornerHandleClass,
        "top-[-6px] right-[-6px] cursor-nesw-resize"
      ),
      direction: "top-right",
    },
    {
      className: cn(
        cornerHandleClass,
        "top-[-6px] left-[-6px] cursor-nwse-resize"
      ),
      direction: "top-left",
    },
    // Edges
    {
      className: cn(
        edgeHandleClass,
        "top-0 bottom-0 right-[-5px] w-[10px] cursor-ew-resize"
      ),
      direction: "right",
    },
    {
      className: cn(
        edgeHandleClass,
        "top-0 bottom-0 left-[-5px] w-[10px] cursor-ew-resize"
      ),
      direction: "left",
    },
    {
      className: cn(
        edgeHandleClass,
        "left-0 right-0 bottom-[-5px] h-[10px] cursor-ns-resize"
      ),
      direction: "bottom",
    },
    {
      className: cn(
        edgeHandleClass,
        "left-0 right-0 top-[-5px] h-[10px] cursor-ns-resize"
      ),
      direction: "top",
    },
  ];

  return (
    <div
      className="absolute bg-background border border-secondary  rounded-lg shadow-xl z-[1000] flex flex-col overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: minSize?.width ? `${minSize.width}px` : "150px", // Apply minWidth directly or use a default
        minHeight: minSize?.height ? `${minSize.height}px` : "100px", // Apply minHeight directly or use a default
      }}
    >
      {/* Title Bar */}
      <div
        className="bg-primary px-3 py-2 border-b border-secondary cursor-move flex justify-between items-center select-none h-10 rounded-t-md shadow-md"
        onMouseDown={handleDragStart}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-white">
          {title}
        </span>
        <button
          className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold text leading-[1px] ml-auto"
          onClick={onClose}
          title="Close"
        >
          X
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-grow overflow-auto bg-card">{children}</div>

      {/* Render Resize Handles */}
      {handles.map((handle) => (
        <div
          key={handle.direction}
          className={handle.className}
          style={handle.style} // Keep style prop for potential overrides or dynamic styles if needed later
          data-resize-handle="true"
          onMouseDown={(e) => handleResizeStart(e, handle.direction)}
        />
      ))}
    </div>
  );
};

export default Window;
