"use client";

//Global Provider
import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { UserSession } from "@/application/types";
import { SessionProvider } from "./SessionProvider";

export default function Provider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: UserSession | null;
}) {
  return (
    <JotaiProvider>
      <SessionProvider session={session}>{children}</SessionProvider>
    </JotaiProvider>
  );
}
