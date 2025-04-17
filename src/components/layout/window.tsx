import { useEffect, useState } from "react";
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
  // Added isMobileOrTablet prop
  isMobileOrTablet: boolean;
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
  isMobileOrTablet,
}) => {
  // State to store window dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Get Jotai setters for focus and update actions
  const focusWindow = useAtom(focusWindowAtom)[1];
  const updateWindowPositionSize = useAtom(updateWindowPositionSizeAtom)[1];

  // Effect to update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Adjust initial position and size for mobile/tablet
  const adjustedInitialPosition = isMobileOrTablet
    ? {
        // Center the window with small margins on mobile
        x: Math.max(10, windowDimensions.width * 0.05),
        y: Math.max(10, windowDimensions.height * 0.1),
      }
    : initialPosition;

  const adjustedInitialSize = isMobileOrTablet
    ? {
        // Use a percentage of screen size instead of full screen
        // This creates margins and a more app-like feel
        width: Math.min(
          windowDimensions.width * 0.9,
          windowDimensions.width - 20
        ),
        height: Math.min(
          windowDimensions.height * 0.8,
          windowDimensions.height - 100
        ),
      }
    : initialSize;

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
      initialSize: adjustedInitialSize,
      initialPosition: adjustedInitialPosition,
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

  // Bring window to front when clicked anywhere on it
  const handleWindowFocus = () => {
    handleFocus(windowId);
  };

  // Hide resize handles on mobile/tablet
  const shouldShowResizeHandles = !isMobileOrTablet;

  // Mobile-specific styling
  const mobileWindowStyles = isMobileOrTablet
    ? {
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        transition: "all 0.2s ease-in-out",
      }
    : {};

  return (
    <div
      className={`absolute bg-background border border-secondary rounded-lg shadow-xl flex flex-col overflow-hidden ${
        isMobileOrTablet ? "mobile-window" : ""
      }`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: minSize?.width ? `${minSize.width}px` : "150px",
        minHeight: minSize?.height ? `${minSize.height}px` : "100px",
        zIndex: zIndex, // Apply zIndex from global state
        ...mobileWindowStyles,
      }}
      onMouseDown={handleWindowFocus} // Bring window to front on click
    >
      {/* Title Bar */}
      <div
        className={`bg-primary px-3 py-2 border-b border-secondary flex justify-between items-center select-none h-10 rounded-t-md shadow-md ${
          isMobileOrTablet ? "mobile-title-bar" : "cursor-move"
        }`}
        onMouseDown={isMobileOrTablet ? undefined : handleDragStart} // Only allow dragging on desktop
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-white">
          {title}
        </span>
        <button
          className={`cursor-pointer bg-destructive text-white rounded-sm w-5 h-5 flex justify-center items-center font-bold text leading-[1px] ml-auto ${
            isMobileOrTablet ? "w-6 h-6" : ""
          }`}
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
      <div
        className={`p-4 flex-grow overflow-auto bg-card ${
          isMobileOrTablet ? "mobile-content" : ""
        }`}
      >
        {children}
      </div>

      {/* Render Resize Handles only on desktop */}
      {shouldShowResizeHandles &&
        handles.map((handle) => (
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
