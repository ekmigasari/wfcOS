"use client";

import React from "react";
import { Provider } from "jotai";

export default function JotaiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      {/* Global managers removed as app state is now tied to window lifecycle */}
      {children}
    </Provider>
  );
}
