import React from "react";
import { formatDurationFromMinutes } from "../sessionLogUtils";

interface SessionLogSummaryProps {
  todaySessionCount: number;
  todayTotalMinutes: number;
  dayStreak: number;
  allSessionCount: number;
  allTotalMinutes: number;
}

export const SessionLogSummary: React.FC<SessionLogSummaryProps> = ({
  todaySessionCount,
  todayTotalMinutes,
  dayStreak,
  allSessionCount,
  allTotalMinutes,
}) => {
  return (
    <div className="mb-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
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
          <p className="text-xs text-muted-foreground">Consecutive activity</p>
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
  );
};
