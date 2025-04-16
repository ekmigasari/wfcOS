import React from "react";
import {
  useWindowManagement,
  ResizeDirection,
} from "../../hooks/useWindowManagement"; // Import ResizeDirection
import { Size } from "../../types"; // Updated path

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

  const windowStyle: React.CSSProperties = {
    position: "absolute", // Use absolute positioning controlled by the hook
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    // transform: "translate(-50%, -50%)", // Remove fixed centering
    backgroundColor: "#f8f9fa", // Light background
    border: "1px solid #dee2e6", // Lighter border
    borderRadius: "8px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)", // Softer shadow
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Prevent content spilling during resize/drag
    minWidth: `${minSize?.width ?? 150}px`, // Apply minWidth/Height via style too
    minHeight: `${minSize?.height ?? 100}px`,
  };

  const titleBarStyle: React.CSSProperties = {
    backgroundColor: "#e9ecef", // Lighter title bar
    padding: "8px 12px",
    borderBottom: "1px solid #dee2e6",
    cursor: "move",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    userSelect: "none", // Prevent text selection on title bar
    height: "35px", // Fixed height for title bar
    boxSizing: "border-box",
  };

  const contentStyle: React.CSSProperties = {
    padding: "16px",
    flexGrow: 1,
    overflow: "auto", // Use auto for both directions
    backgroundColor: "#ffffff",
  };

  const closeButtonStyle: React.CSSProperties = {
    cursor: "pointer",
    border: "none",
    background: "#dc3545", // Standard red
    color: "white",
    borderRadius: "50%",
    width: "18px", // Slightly smaller
    height: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "12px",
    lineHeight: "1px",
    marginLeft: "auto", // Push to the right
  };

  // --- Resize Handle Styles ---
  const handleBaseStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 1001, // Above window content
    userSelect: "none",
  };

  const cornerHandleStyle: React.CSSProperties = {
    ...handleBaseStyle,
    width: "12px",
    height: "12px",
    // background: "rgba(0,0,255,0.3)", // Optional: for debugging visibility
  };

  const edgeHandleStyle: React.CSSProperties = {
    ...handleBaseStyle,
    // background: "rgba(0,255,0,0.3)", // Optional: for debugging visibility
  };

  // Specific handle positions and cursors
  const handles: { style: React.CSSProperties; direction: ResizeDirection }[] =
    [
      // Corners
      {
        style: {
          ...cornerHandleStyle,
          bottom: -6,
          right: -6,
          cursor: "nwse-resize",
        },
        direction: "bottom-right",
      },
      {
        style: {
          ...cornerHandleStyle,
          bottom: -6,
          left: -6,
          cursor: "nesw-resize",
        },
        direction: "bottom-left",
      },
      {
        style: {
          ...cornerHandleStyle,
          top: -6,
          right: -6,
          cursor: "nesw-resize",
        },
        direction: "top-right",
      },
      {
        style: {
          ...cornerHandleStyle,
          top: -6,
          left: -6,
          cursor: "nwse-resize",
        },
        direction: "top-left",
      },
      // Edges
      {
        style: {
          ...edgeHandleStyle,
          top: 0,
          bottom: 0,
          right: -5,
          width: "10px",
          cursor: "ew-resize",
        },
        direction: "right",
      },
      {
        style: {
          ...edgeHandleStyle,
          top: 0,
          bottom: 0,
          left: -5,
          width: "10px",
          cursor: "ew-resize",
        },
        direction: "left",
      },
      {
        style: {
          ...edgeHandleStyle,
          left: 0,
          right: 0,
          bottom: -5,
          height: "10px",
          cursor: "ns-resize",
        },
        direction: "bottom",
      },
      {
        style: {
          ...edgeHandleStyle,
          left: 0,
          right: 0,
          top: -5,
          height: "10px",
          cursor: "ns-resize",
        },
        direction: "top",
      },
    ];

  return (
    <div style={windowStyle}>
      {/* Attach drag handler to the title bar */}
      <div style={titleBarStyle} onMouseDown={handleDragStart}>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        <button style={closeButtonStyle} onClick={onClose} title="Close">
          X
        </button>
      </div>
      <div style={contentStyle}>{children}</div>

      {/* Render Resize Handles */}
      {handles.map((handle) => (
        <div
          key={handle.direction}
          style={handle.style}
          data-resize-handle="true" // Add data attribute
          onMouseDown={(e) => handleResizeStart(e, handle.direction)}
        />
      ))}
    </div>
  );
};

export default Window;
