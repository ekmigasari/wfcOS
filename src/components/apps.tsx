"use client";

import React, { useState } from "react";
import Image from "next/image";

// Define the props for the reusable AppIcon component
interface AppIconProps {
  src: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

// Reusable AppIcon component
const AppIcon: React.FC<AppIconProps> = ({ src, name, isActive, onClick }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer group p-1 rounded transition-opacity duration-150 ease-in-out min-w-30`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={60}
        className={`drop-shadow-lg ${isActive ? "brightness-75" : ""}`}
      />
      <p
        className={`px-1 font-tight shadow-lg mt-1 rounded text-sm ${
          isActive ? "bg-primary text-white" : "bg-white text-secondary"
        }`}
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
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const handleAppClick = (appName: string) => {
    setActiveApp(activeApp === appName ? null : appName);
  };

  return (
    <div className="fixed right-0 p-4 flex flex-col items-end space-y-2">
      {apps.map((app) => (
        <AppIcon
          key={app.name}
          src={app.src}
          name={app.name}
          isActive={activeApp === app.name}
          onClick={() => handleAppClick(app.name)}
        />
      ))}
    </div>
  );
};
