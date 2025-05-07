"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  type ChartConfig, // Import ChartConfig type
} from "@/presentation/components/ui/chart"; // Import Shadcn chart components
import { Button } from "@/presentation/components/ui/button"; // Added import for Button
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

const ITEMS_PER_PAGE = 10; // Added for pagination

// Component to be rendered inside a window
const SessionLogApp = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const allTasks = useAtomValue(tasksAtom);
  const [, deleteSession] = useAtom(deleteSessionAtom);

  // State for pagination
  const [currentPage, setCurrentPage] = React.useState(1);

  // State for chart navigation
  // 0 = current, -1 = previous, 1 = next (adjust as needed for your utility functions)
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [yearOffset, setYearOffset] = React.useState(0);

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

  // REMINDER: Update getWeeklyChartData, getMonthlyChartData, getYearlyChartData in sessionLogUtils.ts
  // to accept and use the offset parameters.
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

  // Pagination logic for table
  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sessions, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handlers for chart navigation
  const handlePreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1); // Can go into future

  const handlePreviousMonth = () => setMonthOffset((prev) => prev - 1);
  const handleNextMonth = () => setMonthOffset((prev) => prev + 1); // Can go into future

  const handlePreviousYear = () => setYearOffset((prev) => prev - 1);
  const handleNextYear = () => setYearOffset((prev) => prev + 1); // Can go into future

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
        // Pass down offset state and handlers
        // The SessionLogCharts component will need to be updated to use these
        // to display navigation controls (e.g., buttons)
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
      {/* <div className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-3">
          Activity Overview
// ... existing code ...
        </Tabs>
      </div> */}

      {/* Table or No Sessions Message */}
      <SessionLogTable
        sessions={paginatedSessions} // Use paginated sessions
        allTasks={allTasks}
        deleteSession={deleteSession}
      />
      {/* Pagination Controls for Table */}
      {sessions.length > ITEMS_PER_PAGE && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
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
