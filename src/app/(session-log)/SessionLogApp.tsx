"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  type ChartConfig, // Import ChartConfig type
} from "@/presentation/components/ui/chart"; // Import Shadcn chart components
import {
  deleteSessionAtom,
  sortedSessionsAtom,
} from "@/application/atoms/sessionAtoms";
import { tasksAtom } from "@/application/atoms/todoListAtom";
// import { Session } from "@/application/types/session.types";
import {
  // formatTime,
  getMonthlyChartData,
  // getTaskName,
  getWeeklyChartData,
  getYearlyChartData,
} from "./sessionLogUtils";
import { SessionLogHeader } from "./components/SessionLogHeader";
import { SessionLogSummary } from "./components/SessionLogSummary";
import { SessionLogCharts } from "./components/SessionLogCharts";
import { SessionLogTable } from "./components/SessionLogTable";

// Helper function to format duration from minutes to hours and minutes
// const formatDurationFromMinutes = (totalMinutes: number): string => {
//   const hours = Math.floor(totalMinutes / 60);
//   const minutes = totalMinutes % 60;
//   let result = "";
//   if (hours > 0) {
//     result += `${hours}h `;
//   }
//   result += `${minutes}m`;
//   return result.trim() || "0m";
// };

// Define chart configuration for Shadcn Chart components
const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "orange", // Temporarily changed to direct color for testing
  },
} satisfies ChartConfig;

// Component to be rendered inside a window
const SessionLogApp = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const allTasks = useAtomValue(tasksAtom);
  const [, deleteSession] = useAtom(deleteSessionAtom);

  // Helper functions for chart data
  // const getWeeklyChartData = React.useCallback(
  //   (currentSessions: Session[]): { name: string; sessions: number }[] => {
  //     const data: { name: string; sessions: number }[] = [];
  //     const today = new Date();
  //     const dayFormatter = new Intl.DateTimeFormat("en-US", {
  //       weekday: "short",
  //     });

  //     for (let i = 6; i >= 0; i--) {
  //       const date = new Date(today);
  //       date.setDate(today.getDate() - i);
  //       const dateString = `${date.getFullYear()}-${String(
  //         date.getMonth() + 1
  //       ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  //       const sessionsOnDate = currentSessions.filter(
  //         (s) => s.date === dateString
  //       ).length;
  //       data.push({
  //         name: dayFormatter.format(date),
  //         sessions: sessionsOnDate,
  //       });
  //     }
  //     return data;
  //   },
  //   []
  // );

  // const getMonthlyChartData = React.useCallback(
  //   (currentSessions: Session[]): { name: string; sessions: number }[] => {
  //     const today = new Date();
  //     const currentMonth = today.getMonth();
  //     const currentYear = today.getFullYear();

  //     const sessionsThisMonth = currentSessions.filter((s) => {
  //       const [year, month] = s.date.split("-").map(Number);
  //       return year === currentYear && month - 1 === currentMonth;
  //     });

  //     const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  //     const numWeeks = Math.ceil(daysInMonth / 7);
  //     const weeklyData: { name: string; sessions: number }[] = Array.from(
  //       { length: numWeeks },
  //       (_, i) => ({
  //         name: `Week ${i + 1}`,
  //         sessions: 0,
  //       })
  //     );

  //     sessionsThisMonth.forEach((s) => {
  //       const dayOfMonth = parseInt(s.date.split("-")[2], 10);
  //       const weekIndex = Math.ceil(dayOfMonth / 7) - 1;
  //       if (weekIndex >= 0 && weekIndex < numWeeks) {
  //         weeklyData[weekIndex].sessions++;
  //       }
  //     });
  //     return weeklyData;
  //   },
  //   []
  // );

  // const getYearlyChartData = React.useCallback(
  //   (currentSessions: Session[]): { name: string; sessions: number }[] => {
  //     const today = new Date();
  //     const currentYear = today.getFullYear();
  //     const monthNames = [
  //       "Jan",
  //       "Feb",
  //       "Mar",
  //       "Apr",
  //       "May",
  //       "Jun",
  //       "Jul",
  //       "Aug",
  //       "Sep",
  //       "Oct",
  //       "Nov",
  //       "Dec",
  //     ];
  //     const monthlyData: { name: string; sessions: number }[] = monthNames.map(
  //       (name) => ({
  //         name,
  //         sessions: 0,
  //       })
  //     );

  //     currentSessions.forEach((s) => {
  //       const [year, monthStr] = s.date.split("-");
  //       const sessionYear = parseInt(year, 10);
  //       const sessionMonth = parseInt(monthStr, 10) - 1; // 0-indexed

  //       if (
  //         sessionYear === currentYear &&
  //         sessionMonth >= 0 &&
  //         sessionMonth < 12
  //       ) {
  //         monthlyData[sessionMonth].sessions++;
  //       }
  //     });
  //     return monthlyData;
  //   },
  //   []
  // );

  const weeklyChartData = React.useMemo(
    () => getWeeklyChartData(sessions),
    [sessions]
  );
  const monthlyChartData = React.useMemo(
    () => getMonthlyChartData(sessions),
    [sessions]
  );
  const yearlyChartData = React.useMemo(
    () => getYearlyChartData(sessions),
    [sessions]
  );

  // Calculate summary data
  const currentDate = new Date();
  const localTodayDateString = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  const todaySessions = sessions.filter((s) => s.date === localTodayDateString);

  const todaySessionCount = todaySessions.length;
  const todayTotalMinutes = todaySessionCount * 25; // Simplified calculation

  const allSessionCount = sessions.length;
  const allTotalMinutes = allSessionCount * 25; // Simplified calculation

  // Calculate Day Streak
  let dayStreak = 0;
  if (sessions.length > 0) {
    const uniqueSortedDates = [...new Set(sessions.map((s) => s.date))].sort(
      (a, b) => b.localeCompare(a)
    );

    const currentDateToMatch = new Date();

    for (const dateStr of uniqueSortedDates) {
      const expectedDateStr = `${currentDateToMatch.getFullYear()}-${String(
        currentDateToMatch.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDateToMatch.getDate()).padStart(
        2,
        "0"
      )}`;

      if (dateStr === expectedDateStr) {
        dayStreak++;
        currentDateToMatch.setDate(currentDateToMatch.getDate() - 1);
      } else if (dayStreak > 0) {
        if (dateStr < expectedDateStr) {
          break;
        }
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateStr = `${yesterday.getFullYear()}-${String(
          yesterday.getMonth() + 1
        ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (dateStr === yesterdayDateStr) {
          dayStreak++;
        }
        break;
      }
    }
  }

  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <SessionLogHeader />
      {/* <header className="mb-4">
        <h1 className="text-xl font-bold text-primary">Work Session Log</h1>
        <p className="text-xs text-muted-foreground">
          Review your completed work sessions.
        </p>
      </header> */}

      {/* Summary Section */}
      <SessionLogSummary
        todaySessionCount={todaySessionCount}
        todayTotalMinutes={todayTotalMinutes}
        dayStreak={dayStreak}
        allSessionCount={allSessionCount}
        allTotalMinutes={allTotalMinutes}
      />
      {/* <div className="mb-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div>
// ... existing code ...
            </p>
          </div>
        </div>
      </div> */}

      {/* Chart Section */}
      <SessionLogCharts
        weeklyChartData={weeklyChartData}
        monthlyChartData={monthlyChartData}
        yearlyChartData={yearlyChartData}
        chartConfig={chartConfig}
      />
      {/* <div className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-3">
          Activity Overview
// ... existing code ...
        </Tabs>
      </div> */}

      {/* Table or No Sessions Message */}
      <SessionLogTable
        sessions={sessions}
        allTasks={allTasks}
        deleteSession={deleteSession}
      />
      {/* {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 flex-grow">
          <p className="text-xl text-muted-foreground mb-2">
// ... existing code ...
        </div>
      )} */}
    </div>
  );
};

export default SessionLogApp;
