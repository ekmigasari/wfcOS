"use client";

import React from "react";
import { Provider } from "jotai";
import { GlobalTimerManager } from "../app/(timer)/components/GlobalTimerManager";
import { GlobalAmbienceManager } from "../app/(ambience)/GlobalAmbienceManager";

export default function JotaiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      {/* Mount global managers to maintain state regardless of window UI status */}
      <GlobalTimerManager />
      <GlobalAmbienceManager />
      {children}
    </Provider>
  );
}
