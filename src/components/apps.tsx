"use client";

import React, { useState } from "react";
import Image from "next/image";
import Window from "./layout/window";
import { appRegistry } from "../config/appRegistry";
import { playSound } from "../lib/utils"; // Import the sound utility

// Define the props for the reusable AppIcon component
interface AppIconProps {
  src: string;
  name: string;
  isOpen: boolean; // Renamed from isActive for clarity (window state)
  isSelected: boolean; // New prop for selection state
  onSelect: () => void; // Renamed from onClick
  onDoubleClick: () => void; // New prop for double click
}

// Reusable AppIcon component
const AppIcon: React.FC<AppIconProps> = ({
  src,
  name,
  isOpen,
  isSelected,
  onSelect,
  onDoubleClick,
}) => {
  // Determine background style based on selection and open state
  let bgStyle = "bg-white text-primary"; // Default
  if (isSelected) {
    bgStyle = "bg-primary text-white"; // Selected style
  } else if (isOpen) {
    // Optional: Keep a distinct style for open apps even if not selected
    // bgStyle = "bg-gray-200 text-gray-800";
  }

  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer group p-1 rounded transition-opacity duration-150 ease-in-out min-w-30`}
      onClick={onSelect} // Use onSelect for single click
      onDoubleClick={onDoubleClick} // Use onDoubleClick
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={60}
        // Apply brightness change only if the window is open
        className={`drop-shadow-lg ${isSelected ? "brightness-75" : ""}`}
      />
      <p
        className={`px-1 font-tight shadow-lg mt-1 rounded text-sm ${bgStyle}`} // Apply dynamic background style
      >
        {name}
      </p>
    </div>
  );
};

// Array of application data
const apps = [
  { src: "/icons/clock.png", name: "Podomoro" },
  { src: "/icons/music.png", name: "Music" },
  { src: "/icons/camera.png", name: "Photobox" },
  { src: "/icons/cafe.png", name: "Cafe list" },
  { src: "/icons/board.png", name: "To-do list" },
  { src: "/icons/phone.png", name: "Chat room" },
];

// Main component to display all app icons
export const AppsIcons = () => {
  const [openApps, setOpenApps] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null); // State for selected app

  // Handler for single click (selection)
  const handleSelect = (appName: string) => {
    playSound("/sounds/click.mp3"); // Play click sound
    setSelectedApp(appName);
  };

  // Handler for double click (open/close)
  const handleDoubleClick = (appName: string) => {
    setOpenApps((prevOpenApps) => {
      if (prevOpenApps.includes(appName)) {
        // Optional: If double-clicking an open app, maybe just bring window to front?
        // For now, we'll keep the toggle behavior. If you want to change this, let me know.
        // playSound("/sounds/close.mp3"); // Consider if close sound should play here too
        return prevOpenApps.filter((name) => name !== appName);
      } else {
        // Open the app
        playSound("/sounds/open.mp3"); // Play open sound
        // Open the app and potentially clear selection? Or keep selection?
        // setSelectedApp(null); // Option: Clear selection on open
        return [...prevOpenApps, appName];
      }
    });
    // Optionally clear selection when an app is opened/closed by double click
    // setSelectedApp(null);
  };

  const handleCloseWindow = (appName: string) => {
    playSound("/sounds/close.mp3"); // Play close sound
    setOpenApps((prevOpenApps) =>
      prevOpenApps.filter((name) => name !== appName)
    );
    // If the closed app was selected, clear selection
    if (selectedApp === appName) {
      setSelectedApp(null);
    }
  };

  return (
    <>
      {/* Optional: Add a click handler to the background to clear selection */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setSelectedApp(null)}
      ></div>

      <div className="fixed right-0 p-4 flex flex-col items-end space-y-2 z-10">
        {apps.map((app) => (
          <AppIcon
            key={app.name}
            src={app.src}
            name={app.name}
            isOpen={openApps.includes(app.name)} // Pass window open state
            isSelected={selectedApp === app.name} // Pass selection state
            onSelect={() => handleSelect(app.name)} // Pass select handler
            onDoubleClick={() => handleDoubleClick(app.name)} // Pass double click handler
          />
        ))}
      </div>

      {/* Render a Window for each app in the openApps array */}
      {openApps.map((appName) => {
        const appConfig = appRegistry[appName];
        // Ensure the app exists in the registry
        if (!appConfig) {
          console.error(`App configuration not found for: ${appName}`);
          // Optionally close the non-existent app window
          // handleCloseWindow(appName);
          return null; // Don't render anything if config is missing
        }

        const AppComponent = appConfig.component;

        return (
          <Window
            key={appName} // Use appName as the key
            title={appName} // Use appName as the title (or get from registry if available)
            isOpen={true} // Window is open if it's being rendered
            onClose={() => handleCloseWindow(appName)}
            defaultSize={appConfig.defaultSize}
          >
            <AppComponent />
          </Window>
        );
      })}
    </>
  );
};
