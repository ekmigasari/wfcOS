"use client";

import React, { createContext, useContext, useMemo } from "react";

type WindowState = {
  isMinimized: boolean;
  isOpen: boolean;
  onClose: () => void;
};

const WindowContext = createContext<WindowState | null>(null);

export const useWindowState = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindowState must be used within WindowProvider");
  }
  return context;
};

export const WindowProvider = ({
  children,
  isMinimized,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isMinimized: boolean;
  isOpen: boolean;
  onClose: () => void;
}) => {
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return { isMinimized, isOpen, onClose };
  }, [isMinimized, isOpen, onClose]);

  // Memoize children to maintain their identity
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <WindowContext.Provider value={contextValue}>
      {memoizedChildren}
    </WindowContext.Provider>
  );
};
