import React from "react";
import { formatDurationFromMinutes } from "@/app/(session-log)/sessionLogUtils"; // Assuming this utility is needed and path is correct

interface ActivitySummaryProps {
  todaySessionCount: number;
  todayTotalMinutes: number;
  currentStreak: number;
  thisMonthSessionCount: number; // Placeholder data
  thisMonthTotalMinutes: number; // Placeholder data
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  todaySessionCount,
  todayTotalMinutes,
  currentStreak,
  thisMonthSessionCount,
  thisMonthTotalMinutes,
}) => {
  return (
    <div className="mb-4 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs w-full">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider">
            Today
          </h4>
          <p className="text-sm font-bold text-primary">
            {todaySessionCount} sessions
          </p>
          <p className="text-xxs text-muted-foreground">
            {formatDurationFromMinutes(todayTotalMinutes)}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider">
            Streak
          </h4>
          <p className="text-sm font-bold text-primary">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider">
            This Month
          </h4>
          <p className="text-sm font-bold text-primary">
            {thisMonthSessionCount} sessions
          </p>
          <p className="text-xxs text-muted-foreground">
            {formatDurationFromMinutes(thisMonthTotalMinutes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummary;
