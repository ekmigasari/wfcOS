import React from "react";
import Image from "next/image";
interface AppIconProps {
  src: string;
  name: string;
  appId: string;
  // onDoubleClick: (appId: string) => void;
}

//Single App Icon
export const AppIcon = ({ src, name }: AppIconProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded transition-opacity duration-150 ease-in-out min-w-24"
      // onDoubleClick={() => onDoubleClick(appId)} // Trigger open/focus action
    >
      <Image
        src={src}
        alt={name}
        width={60}
        height={60}
        className={`drop-shadow-lg`} // Remove brightness change for now
      />
      <p className="px-1 font-tight shadow-lg mt-1 rounded text-sm bg-white text-primary">
        {name}
      </p>
    </div>
  );
};
