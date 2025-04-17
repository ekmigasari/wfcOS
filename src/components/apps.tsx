"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Window from "./layout/window";
import { appRegistry } from "../config/appRegistry";
import { playSound } from "../lib/utils"; // Import the sound utility
import { useAtom } from "jotai";
import {
  openWindowsAtom, // Read atom for currently open windows
  openWindowAtom, // Write atom to open/focus a window
  closeWindowAtom, // Write atom to close a window
  // focusWindowAtom, // Write atom to bring window to front (used by Window component later)
  // WindowState, // Import type if needed
} from "../atoms/windowAtoms"; // Adjust path as necessary
// import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique window IDs

// Define the props for the reusable AppIcon component
interface AppIconProps {
  src: string;
  name: string;
  appId: string; // Use appId from registry
  // isOpen: boolean; // Determined by checking openWindowsAtom now
  // isSelected: boolean; // Selection might be handled differently (e.g., based on z-index or a separate atom)
  onDoubleClick: (appId: string) => void; // Pass appId on double click
  // Consider adding onSelect if needed for single-click behavior
}

// Reusable AppIcon component
const AppIcon: React.FC<AppIconProps> = ({
  src,
  name,
  appId,
  onDoubleClick,
}) => {
  // Selection/Open style might be derived differently now or simplified
  // For now, let's remove the dynamic background based on isSelected/isOpen
  const bgStyle = "bg-white text-primary";

  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer group p-1 rounded transition-opacity duration-150 ease-in-out min-w-30`}
      //   onClick={onSelect} // Single click might focus desktop or select icon differently
      onDoubleClick={() => onDoubleClick(appId)} // Trigger open/focus action
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={60}
        className={`drop-shadow-lg`} // Remove brightness change for now
      />
      <p
        className={`px-1 font-tight shadow-lg mt-1 rounded text-sm ${bgStyle}`}
      >
        {name}
      </p>
    </div>
  );
};

// Main component to display all app icons
export const AppsIcons = () => {
  // Get the list of open windows from the Jotai atom
  const openWindows = useAtom(openWindowsAtom)[0]; // Read-only access to the derived atom

  // Get the setter functions for window actions
  const openWindow = useAtom(openWindowAtom)[1];
  const closeWindow = useAtom(closeWindowAtom)[1];
  // const focusWindow = useAtom(focusWindowAtom)[1]; // focusWindow will be used inside the Window component

  // Local state for selection might still be needed if we want desktop icon selection independent of window focus
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Mobile/tablet detection
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Check for mobile/tablet on component mount
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile =
        /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isTablet =
        /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);
      setIsMobileOrTablet(isMobile || isTablet);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // Convert appRegistry to an array for mapping (if it's an object)
  const apps = Object.entries(appRegistry).map(([id, config]) => ({
    id, // This is the appId
    ...config,
  }));

  const openAppWindow = (appId: string) => {
    const appConfig = appRegistry[appId];
    if (!appConfig) return;

    playSound("/sounds/open.mp3"); // Play open sound

    // We need a unique ID for each window instance, even of the same app type.
    // If an instance already exists, openWindowAtom should focus it.
    // If not, it creates a new one.
    // Let's generate a predictable ID based on appId for simplicity for now,
    // or handle multiple instances if needed. Assuming single instance per appId for now.
    // A better approach for multi-instance would use uuidv4() always.
    const windowInstanceId = `${appId}-instance`; // Simple instance ID

    openWindow({
      id: windowInstanceId, // Unique ID for this instance
      appId: appId,
      title: appConfig.name, // Use name from registry
      minSize: appConfig.minSize,
      initialSize: appConfig.defaultSize, // Pass initial size
      // initialPosition will be handled by openWindowAtom (loads saved or calculates default)
    });
    setSelectedAppId(appId); // Optionally select the icon on double click
  };

  const handleDoubleClick = (appId: string) => {
    openAppWindow(appId);
  };

  const handleCloseWindow = (windowId: string) => {
    playSound("/sounds/close.mp3"); // Play close sound
    closeWindow(windowId); // Use the Jotai action atom
    // No need to manage selectedAppId here unless closing should deselect icon
  };

  const handleSelectIcon = (appId: string) => {
    setSelectedAppId(appId);
    // Maybe play a click sound?
    playSound("/sounds/click.mp3");

    // For mobile/tablet, open the window on a single click
    if (isMobileOrTablet) {
      openAppWindow(appId);
    }
  };

  return (
    <>
      {/* Background click to clear selection */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setSelectedAppId(null)}
      ></div>

      {/* Desktop Icons */}
      <div className="fixed right-0 p-4 flex flex-col items-end space-y-2 z-10">
        {apps.map((app) => (
          <div
            key={app.id}
            onClick={() => handleSelectIcon(app.id)} // Wrap icon for selection click area
            className={`p-1 rounded ${
              selectedAppId === app.id ? "brightness-50" : ""
            }`} // Basic selection highlight
          >
            <AppIcon
              src={app.src}
              name={app.name}
              appId={app.id} // Pass appId
              onDoubleClick={handleDoubleClick}
            />
          </div>
        ))}
      </div>

      {/* Render Windows based on the openWindows atom */}
      {openWindows.map((windowState) => {
        const appConfig = appRegistry[windowState.appId];
        if (!appConfig) {
          console.error(
            `App configuration not found for: ${windowState.appId}. Closing window ID: ${windowState.id}`
          );
          // Close the inconsistent window state
          closeWindow(windowState.id);
          return null;
        }

        const AppComponent = appConfig.component;

        // We need to pass the unique window ID and other state down to the Window component
        return (
          <Window
            key={windowState.id} // Use the unique window instance ID
            windowId={windowState.id} // Pass windowId down
            title={windowState.title}
            isOpen={windowState.isOpen} // Should always be true from openWindowsAtom, but good practice
            onClose={() => handleCloseWindow(windowState.id)}
            // Pass state needed by useWindowManagement *inside* Window
            initialPosition={windowState.position}
            initialSize={windowState.size}
            minSize={windowState.minSize}
            zIndex={windowState.zIndex} // Pass zIndex down
            isMobileOrTablet={isMobileOrTablet} // Pass mobile/tablet detection
            // onFocus will be handled inside Window
          >
            <AppComponent />
          </Window>
        );
      })}
    </>
  );
};
