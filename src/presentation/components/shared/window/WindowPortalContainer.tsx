"use client";

import React, { useEffect, useState } from "react";

/**
 * WindowPortalContainer Component
 *
 * Renders a container element that serves as the target for window portals.
 * This component provides a DOM node that exists outside the main app hierarchy
 * allowing windows to render in isolation from the rest of the application.
 */
export const WindowPortalContainer = () => {
  // We need to ensure this component only renders on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      id="window-portal-container"
      className="fixed inset-0 z-[100]"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
};
