"use client";

import React from "react";

import { SessionLogHeader } from "./components/SessionLogHeader";
import { SummarySection } from "./components/SummarySection";
import { ChartsSection } from "./components/ChartsSection";
import { TableSection } from "./components/TableSection";

const SessionLogApp = () => {
  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <SessionLogHeader />

      {/* Summary Section */}
      <SummarySection />

      {/* Chart Section */}
      <ChartsSection />

      {/* Table or No Sessions Message */}
      <TableSection />
    </div>
  );
};

export default SessionLogApp;
