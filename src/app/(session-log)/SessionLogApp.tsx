"use client";

import React from "react";

import { SessionLogHeader } from "./components/SessionLogHeader";
import { ChartsSection } from "./components/ChartsSection";
import { TableSection } from "./components/TableSection";

const SessionLogApp = () => {
  return (
    <div className="p-4 h-full flex flex-col text-sm overflow-y-auto">
      <SessionLogHeader />

      {/* Chart Section */}
      <ChartsSection />
      {/* Table or No Sessions Message */}
      <TableSection />
    </div>
  );
};

export default SessionLogApp;
