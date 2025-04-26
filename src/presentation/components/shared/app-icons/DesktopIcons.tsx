"use client";

import { appRegistry } from "@/infrastructure/config/appRegistry";
import { AppIcon } from "./AppIcon";

export const DesktopIcons = () => {
  // Convert appRegistry to an array for mapping (if it's an object)
  const apps = Object.entries(appRegistry).map(([id, config]) => ({
    id, // This is the appId
    ...config,
  }));

  return (
    <>
      {/* Background click to clear selection */}
      <div className="inset-0 -z-10"></div>
      {/* Desktop Icons */}
      <div className="absolute top-4 right-4 flex flex-col flex-wrap-reverse gap-2z-10 max-h-[calc(100vh-80px)]">
        {apps.map((app) => (
          <div
            key={app.id}
            // onClick={() => handleSelectIcon(app.id)}
            // className={`p-1 rounded ${
            //   selectedAppId === app.id ? "brightness-50" : ""
            // }`}
          >
            <AppIcon
              src={app.src}
              name={app.name}
              appId={app.id}
              // onDoubleClick={handleDoubleClick}
            />
          </div>
        ))}
      </div>
    </>
  );
};
