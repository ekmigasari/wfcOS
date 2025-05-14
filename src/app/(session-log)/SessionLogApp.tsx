"use client";

import React from "react";

import { ChartsSection } from "./components/ChartsSection";
import { SessionLogHeader } from "./components/SessionLogHeader";
import { TableSection } from "./components/TableSection";

const SessionLogApp = () => {
  return (
    <div className="p-4 h-full flex flex-col text-sm overflow-y-auto">
      <div>
        <SessionLogHeader />
      </div>

      {/* Chart Section */}
      <ChartsSection />
      {/* Table or No Sessions Message */}
      <TableSection />
    </div>
  );
};

export default SessionLogApp;
