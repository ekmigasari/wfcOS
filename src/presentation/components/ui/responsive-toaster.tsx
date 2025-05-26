"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { useDeviceDetect } from "@/application/hooks";

const ResponsiveToaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { isMobileOrTablet } = useDeviceDetect();

  // Detect tablet specifically (screen width between 768px and 1024px)
  const isTablet = typeof window !== 'undefined' && 
    window.innerWidth >= 768 && 
    window.innerWidth <= 1024 && 
    isMobileOrTablet;

  // Determine position based on device
  const position = isTablet ? "bottom-right" : "bottom-center";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { ResponsiveToaster as Toaster }; 