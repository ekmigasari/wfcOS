"use client";

import React from "react";
import { Provider } from "jotai";
import { GlobalPodomoroTimer } from "../components/apps/podomoro";
import { GlobalTimerManager } from "../app/(timer)/components/GlobalTimerManager";
import { GlobalMusicManager } from "../app/(music-player)/components/GlobalMusicManager";

export default function JotaiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      {/* Mount global managers to maintain state regardless of window UI status */}
      <GlobalPodomoroTimer />
      <GlobalTimerManager />
      <GlobalMusicManager />
      {children}
    </Provider>
  );
}
