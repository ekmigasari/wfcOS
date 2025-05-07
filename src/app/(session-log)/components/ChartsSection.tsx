"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { sortedSessionsAtom } from "@/application/atoms/sessionAtoms";
import {
  getMonthlyChartData,
  getWeeklyChartData,
  getYearlyChartData,
} from "../sessionLogUtils"; // Path relative to this new file (components/ -> (session-log)/)
import { SessionLogCharts } from "./SessionLogCharts"; // Assuming SessionLogCharts.tsx is in the same directory
import { type ChartConfig } from "@/presentation/components/ui/chart";

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "hsl(var(--chart-1))", // Using CSS variable for color
  },
} satisfies ChartConfig;

export const ChartsSection = () => {
  const sessions = useAtomValue(sortedSessionsAtom);

  const [weekOffset, setWeekOffset] = React.useState(0);
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [yearOffset, setYearOffset] = React.useState(0);

  const weeklyChartData = React.useMemo(
    () => getWeeklyChartData(sessions, weekOffset),
    [sessions, weekOffset]
  );
  const monthlyChartData = React.useMemo(
    () => getMonthlyChartData(sessions, monthOffset),
    [sessions, monthOffset]
  );
  const yearlyChartData = React.useMemo(
    () => getYearlyChartData(sessions, yearOffset),
    [sessions, yearOffset]
  );

  const handlePreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handlePreviousMonth = () => setMonthOffset((prev) => prev - 1);
  const handleNextMonth = () => setMonthOffset((prev) => prev + 1);
  const handlePreviousYear = () => setYearOffset((prev) => prev - 1);
  const handleNextYear = () => setYearOffset((prev) => prev + 1);

  return (
    <SessionLogCharts
      weeklyChartData={weeklyChartData}
      monthlyChartData={monthlyChartData}
      yearlyChartData={yearlyChartData}
      chartConfig={chartConfig}
      onPrevWeek={handlePreviousWeek}
      onNextWeek={handleNextWeek}
      onPrevMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
      onPrevYear={handlePreviousYear}
      onNextYear={handleNextYear}
      weekOffset={weekOffset}
      monthOffset={monthOffset}
      yearOffset={yearOffset}
    />
  );
};
