"use client";

import React from "react";
import { Provider } from "jotai";
import { GlobalPodomoroTimer } from "../apps/podomoro";

export default function JotaiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      {/* Mount the global timer component here so it runs regardless of whether the Podomoro window is open */}
      <GlobalPodomoroTimer />
      {children}
    </Provider>
  );
}
