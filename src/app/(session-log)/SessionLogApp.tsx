"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  sortedSessionsAtom,
  deleteSessionAtom,
} from "@/application/atoms/sessionAtoms";
import { tasksAtom, TaskItem } from "@/application/atoms/todoListAtom"; // To get task names
import { Session } from "@/application/types/session.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { Button } from "@/presentation/components/ui/button";
import { Trash2 } from "lucide-react";

// Helper function to format duration from minutes to hours and minutes
const formatDurationFromMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (hours > 0) {
    result += `${hours}h `;
  }
  result += `${minutes}m`;
  return result.trim() || "0m"; // Handle case where totalMinutes is 0
};

// Component to be rendered inside a window
const SessionLogApp = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const allTasks = useAtomValue(tasksAtom);
  const [, deleteSession] = useAtom(deleteSessionAtom);

  const getTaskName = (taskId: string | null): string => {
    if (!taskId) return "N/A";
    const task = allTasks.find((t: TaskItem) => t.id === taskId);
    return task ? task.content : "Deleted Task";
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    ); // Sort YYYY-MM-DD strings descending

    const currentDateToMatch = new Date(); // Start with today (local)

    for (const dateStr of uniqueSortedDates) {
      const expectedDateStr = `${currentDateToMatch.getFullYear()}-${String(
        currentDateToMatch.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDateToMatch.getDate()).padStart(
        2,
        "0"
      )}`;

      if (dateStr === expectedDateStr) {
        dayStreak++;
        currentDateToMatch.setDate(currentDateToMatch.getDate() - 1); // Move to check for the previous day
      } else if (dayStreak > 0) {
        // If a streak was started but the current dateStr doesn't continue it, break.
        // This handles gaps correctly if the dates are not perfectly consecutive from today.
        // However, if dateStr is older than expectedDateStr, it also means the streak is broken.
        // To be more precise, if dateStr < expectedDateStr (lexicographically for YYYY-MM-DD), the streak is broken.
        if (dateStr < expectedDateStr) {
          break;
        }
        // If dateStr is somehow newer (shouldn't happen with sorted dates and decrementing currentDateToMatch starting from today)
        // or if there's a gap, the streak ends.
      } else {
        // If no streak started and the first date isn't today or yesterday, streak remains 0.
        // If the very first unique date is not today, we need to check if it was yesterday.
        // If it wasn't today, and dayStreak is still 0, check if it's yesterday for a streak of 1.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateStr = `${yesterday.getFullYear()}-${String(
          yesterday.getMonth() + 1
        ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (dateStr === yesterdayDateStr) {
          dayStreak++;
          // For this specific case, we don't continue checking further back from yesterday if today had no session.
        }
        break; // Break because the first available date didn't start a streak from today.
      }
    }
  }

  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-primary">Work Session Log</h1>
        <p className="text-xs text-muted-foreground">
          Review your completed work sessions.
        </p>
      </header>

      {/* Summary Section */}
      <div className="mb-6 p-3 bg-stone-100 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today
            </h3>
            <p className="text-lg font-bold text-primary">
              {todaySessionCount} sessions
            </p>
            <p className="text-xs text-muted-foreground">
              ~ {formatDurationFromMinutes(todayTotalMinutes)}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Day Streak
            </h3>
            <p className="text-lg font-bold text-primary">
              {dayStreak} {dayStreak === 1 ? "day" : "days"}
            </p>
            <p className="text-xs text-muted-foreground">
              Consecutive activity
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              All Time
            </h3>
            <p className="text-lg font-bold text-primary">
              {allSessionCount} sessions
            </p>
            <p className="text-xs text-muted-foreground">
              ~ {formatDurationFromMinutes(allTotalMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* Table or No Sessions Message */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 flex-grow">
          <p className="text-xl text-muted-foreground mb-2">
            No sessions recorded yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Complete a work timer to see your sessions here.
          </p>
        </div>
      ) : (
        <div className="overflow-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead className="w-[90px]">Start</TableHead>
                <TableHead className="w-[90px]">End</TableHead>
                <TableHead className="w-[70px]">Duration</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-[70px] text-right">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: Session) => (
                <TableRow key={session.id} className="text-xs">
                  <TableCell className="py-1.5 px-2">{session.date}</TableCell>
                  <TableCell className="py-1.5 px-2">
                    {formatTime(session.startTime)}
                  </TableCell>
                  <TableCell className="py-1.5 px-2">
                    {formatTime(session.endTime)}
                  </TableCell>
                  <TableCell className="py-1.5 px-2">
                    {session.duration} min
                  </TableCell>
                  <TableCell className="py-1.5 px-2">
                    {getTaskName(session.taskId)}
                  </TableCell>
                  <TableCell className="text-right py-1.5 px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSession(session.id)}
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SessionLogApp;
