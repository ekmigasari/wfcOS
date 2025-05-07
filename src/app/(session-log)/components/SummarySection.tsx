"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { sortedSessionsAtom } from "@/application/atoms/sessionAtoms";
import { SessionLogSummary } from "./SessionLogSummary";
import {
  calculateCurrentWeekSessions,
  calculateCurrentMonthSessions,
  calculateCurrentYearSessions,
} from "../sessionLogUtils";

export const SummarySection = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const currentDate = new Date();

  // const localTodayDateString = `${currentDate.getFullYear()}-${String(
  //   currentDate.getMonth() + 1
  // ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  // const todaySessions = sessions.filter((s) => s.date === localTodayDateString);
  // const todaySessionCount = todaySessions.length;
  // const todayTotalMinutes = todaySessionCount * 25; // Simplified calculation - Handled by ActivitySummary

  const { count: thisWeekSessionCount, totalMinutes: thisWeekTotalMinutes } =
    calculateCurrentWeekSessions(sessions, currentDate);
  const { count: thisMonthSessionCount, totalMinutes: thisMonthTotalMinutes } =
    calculateCurrentMonthSessions(sessions, currentDate);
  const { count: thisYearSessionCount, totalMinutes: thisYearTotalMinutes } =
    calculateCurrentYearSessions(sessions, currentDate);

  // Day streak calculation is now in utils and used in Timer.tsx, not here
  // const dayStreak = calculateDayStreak(sessions, currentDate);

  const allSessionCount = sessions.length;
  // Assuming DEFAULT_SESSION_DURATION_MINUTES is used in utils or Session objects have duration
  // For consistency, if individual session durations are available, they should be summed up.
  // Here, we'll rely on the utils' multiplication or a future enhancement for precise total minutes.
  const allTotalMinutes = sessions.reduce(
    (acc, s) => acc + (s.duration || 25),
    0
  ); // More accurate if duration exists

  return (
    <SessionLogSummary
      thisWeekSessionCount={thisWeekSessionCount}
      thisWeekTotalMinutes={thisWeekTotalMinutes}
      thisMonthSessionCount={thisMonthSessionCount}
      thisMonthTotalMinutes={thisMonthTotalMinutes}
      thisYearSessionCount={thisYearSessionCount}
      thisYearTotalMinutes={thisYearTotalMinutes}
      allSessionCount={allSessionCount}
      allTotalMinutes={allTotalMinutes} // Use the more accurate sum here
    />
  );
};
