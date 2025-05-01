"use client";

import React, { createContext, useContext } from "react";

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
}

const WindowContext = createContext<WindowState | null>(null);

/**
 * Hook to access window state from child components
 */
export const useWindowState = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindowState must be used within WindowProvider");
  }
  return context;
};

/**
 * Provider component that passes window state to child components
 */
export const WindowProvider = ({
  children,
  isOpen,
  isMinimized,
  onClose,
}: WindowState & { children: React.ReactNode }) => {
  return (
    <WindowContext.Provider value={{ isOpen, isMinimized, onClose }}>
      {children}
    </WindowContext.Provider>
  );
};
