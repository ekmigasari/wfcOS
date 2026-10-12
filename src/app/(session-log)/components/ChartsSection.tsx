"use client";

import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import React from "react";
import { sortedSessionsAtom } from "@/application/atoms/sessionAtoms";
import { type ChartConfig } from "@/presentation/components/ui/chart";
import {
  getMonthlyChartData,
  getWeeklyChartData,
  getYearlyChartData,
} from "../sessionLogUtils"; // Path relative to this new file (components/ -> (session-log)/)

const loadSessionLogCharts = () =>
  import("./SessionLogCharts").then((mod) => mod.SessionLogCharts);

export const preloadSessionLogAssets = async () => {
  await loadSessionLogCharts();
};

const SessionLogCharts = dynamic(loadSessionLogCharts, { ssr: false });

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
