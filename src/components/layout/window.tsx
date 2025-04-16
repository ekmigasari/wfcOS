import React from "react";
import { useAtom } from "jotai"; // Import useAtom
import {
  useWindowManagement,
  ResizeDirection,
} from "../../hooks/useWindowManagement";
import { Size, Position } from "../../types"; // Updated path, added Position
import { cn } from "../../lib/utils";
import {
  focusWindowAtom,
  updateWindowPositionSizeAtom,
} from "../../atoms/windowAtoms"; // Import Jotai atoms

interface WindowProps {
  windowId: string; // Unique identifier for this window instance
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  // State now comes from the global atom, passed down from AppsIcons
  initialSize: Size;
  initialPosition: Position;
  minSize?: Size;
  zIndex: number; // Pass zIndex for styling
  // Removed defaultSize as initialSize/Position are now required
}

const Window: React.FC<WindowProps> = ({
  windowId,
  title,
  children,
  isOpen,
  onClose,
  initialSize,
  initialPosition,
  minSize,
  zIndex,
}) => {
  // Get Jotai setters for focus and update actions
  const focusWindow = useAtom(focusWindowAtom)[1];
  const updateWindowPositionSize = useAtom(updateWindowPositionSizeAtom)[1];

  // Callback for the hook to update global state
  const handleInteractionEnd = (
    id: string,
    newPosition: Position,
    newSize: Size
  ) => {
    updateWindowPositionSize({ id, position: newPosition, size: newSize });
  };

  // Callback for the hook to focus the window
  const handleFocus = (id: string) => {
    focusWindow(id);
  };

  const { position, size, handleDragStart, handleResizeStart } =
    useWindowManagement({
      windowId,
      initialSize,
      initialPosition,
      minSize,
      onInteractionEnd: handleInteractionEnd, // Pass callback
      onFocus: handleFocus, // Pass focus callback
      // containerRef could be added here if needed
    });

  // Don't render if not open (redundant if filtered upstream, but safe)
  if (!isOpen) {
    return null;
  }

  // --- Resize Handles --- (Keep existing handle definitions)
  const handleBaseClass = "absolute z-[1001] select-none"; // zIndex might need adjustment relative to window zIndex
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
      className: cn(
        edgeHandleClass,
        "top-[25%] bottom-[25%] right-[-3px] w-[6px]"
      ),
      direction: "right",
      style: { cursor: "ew-resize" },
    },
    {
      className: cn(
        edgeHandleClass,
        "top-[25%] bottom-[25%] left-[-3px] w-[6px]"
      ),
      direction: "left",
      style: { cursor: "ew-resize" },
    },
    {
      className: cn(
        edgeHandleClass,
        "left-[25%] right-[25%] bottom-[-3px] h-[6px]"
      ),
      direction: "bottom",
      style: { cursor: "ns-resize" },
    },
    {
      className: cn(
        edgeHandleClass,
        "left-[25%] right-[25%] top-[-3px] h-[6px]"
      ),
      direction: "top",
      style: { cursor: "ns-resize" },
    },
  ];

  // Bring window to front when clicked anywhere on it
  const handleWindowFocus = () => {
    handleFocus(windowId);
  };

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
        zIndex: zIndex, // Apply zIndex from global state
      }}
      onMouseDown={handleWindowFocus} // Bring window to front on click
    >
      {/* Title Bar */}
      <div
        className="bg-primary px-3 py-2 border-b border-secondary cursor-move flex justify-between items-center select-none h-10 rounded-t-md shadow-md"
        onMouseDown={handleDragStart} // Attach drag handler here
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-white">
          {title}
        </span>
        <button
          className="cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold text leading-[1px] ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} // Prevent focus change on close click
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
          style={handle.style}
          data-resize-handle="true"
          // Attach resize handler to the handle itself
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent window focus handler
            handleResizeStart(e, handle.direction);
          }}
        />
      ))}
    </div>
  );
};

export default Window;
