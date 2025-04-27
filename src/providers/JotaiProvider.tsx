"use client";

import React from "react";
import { Provider } from "jotai";
import { GlobalPodomoroTimer } from "../components/apps/podomoro";
import { GlobalTimerManager } from "../app/(timer)/components/GlobalTimerManager";

export default function JotaiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      {/* Mount global timer managers to maintain state regardless of window UI status */}
      <GlobalPodomoroTimer />
      <GlobalTimerManager />
      {children}
    </Provider>
  );
}
