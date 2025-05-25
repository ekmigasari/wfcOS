"use client";

import { UserSession } from "@/application/types";
import { createContext, useContext } from "react";

const SessionContext = createContext<UserSession | null>(null);

export const SessionProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: UserSession | null;
}) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
};
