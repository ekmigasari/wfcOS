"use client";

import React, { useEffect, useState } from "react";
import { useWindowState } from "../../presentation/components/shared/window/WindowProvider";

/**
 * Example App Component
 *
 * This is an example of how to create an application that properly works with
 * the window lifecycle system. It demonstrates:
 *
 * 1. Using the window state context
 * 2. Handling window close events
 * 3. Responding to minimize events
 * 4. Cleaning up resources when window closes
 */
export default function Page() {
  // Access window state from context
  const { isOpen, isMinimized, onClose } = useWindowState();

  // Application-specific state
  const [data, setData] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize app resources
  useEffect(() => {
    console.log("App mounted - initializing resources");

    // Example: Start a timer or fetch initial data
    const timerId = setInterval(() => {
      // Only add data if the window is open and not minimized
      if (isOpen && !isMinimized) {
        setData((prev) => [...prev, `Item ${prev.length + 1}`]);
      }
    }, 5000);

    // Cleanup when component unmounts
    return () => {
      console.log("App unmounted - cleaning up resources");
      clearInterval(timerId);
    };
  }, [isOpen, isMinimized]);

  // Respond to window state changes
  useEffect(() => {
    if (!isOpen) {
      // Save state or clean up when window closes
      console.log("Window closed - saving state");
      // Example: Save data to localStorage
      localStorage.setItem("app-example-data", JSON.stringify(data));
    }
  }, [isOpen, data]);

  // Pause expensive operations when minimized
  useEffect(() => {
    if (isMinimized) {
      console.log("Window minimized - pausing operations");
      setIsProcessing(false);
    } else if (isOpen) {
      console.log("Window visible - resuming operations");
      setIsProcessing(true);
    }
  }, [isMinimized, isOpen]);

  // Handle user-initiated close
  const handleAppClose = () => {
    console.log("App initiating close");
    // Do any app-specific cleanup
    onClose(); // Call the window's onClose
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Example App</h2>
        <p className="text-sm text-muted-foreground">
          Status: {isProcessing ? "Processing" : "Paused"}
        </p>
      </div>

      <div className="flex-grow overflow-auto border rounded p-2">
        {data.length === 0 ? (
          <p className="text-muted-foreground">No data yet</p>
        ) : (
          <ul>
            {data.map((item, index) => (
              <li key={index} className="py-1 border-b last:border-b-0">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded"
          onClick={handleAppClose}
        >
          Close App
        </button>
      </div>
    </div>
  );
}
