"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { sortedSessionsAtom } from "@/application/atoms/sessionAtoms";
import { SessionLogSummary } from "./SessionLogSummary"; // Assuming SessionLogSummary.tsx is in the same directory

export const SummarySection = () => {
  const sessions = useAtomValue(sortedSessionsAtom);

  const currentDate = new Date();
  const localTodayDateString = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  const todaySessions = sessions.filter((s) => s.date === localTodayDateString);

  const todaySessionCount = todaySessions.length;
  const todayTotalMinutes = todaySessionCount * 25; // Simplified calculation

  const allSessionCount = sessions.length;
  const allTotalMinutes = allSessionCount * 25; // Simplified calculation

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
        // If we had a streak but the current date doesn't match the next expected date in sequence
        if (dateStr < expectedDateStr) {
          // If the current session date is older than what we expected
          break; // Streak is broken
        }
        // If dateStr > expectedDateStr, it means there's a gap, also break. Handled by the initial check mostly.
      } else {
        // If no streak yet, check if the current session is for yesterday to start a streak of 1
        const yesterday = new Date();
        yesterday.setDate(currentDate.getDate() - 1); // Check against original current date's yesterday
        const yesterdayDateStr = `${yesterday.getFullYear()}-${String(
          yesterday.getMonth() + 1
        ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (dateStr === yesterdayDateStr) {
          dayStreak++;
        }
        break; // After checking the most recent (or yesterday), stop.
      }
    }
  }

  return (
    <SessionLogSummary
      todaySessionCount={todaySessionCount}
      todayTotalMinutes={todayTotalMinutes}
      dayStreak={dayStreak}
      allSessionCount={allSessionCount}
      allTotalMinutes={allTotalMinutes}
    />
  );
};
