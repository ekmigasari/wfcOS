"use client";

import { Provider } from "jotai";
import React from "react";

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
