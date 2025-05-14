import React from "react";

import { formatDurationFromMinutes } from "../sessionLogUtils";

interface SessionLogSummaryProps {
  thisWeekSessionCount: number;
  thisWeekTotalMinutes: number;
  thisMonthSessionCount: number;
  thisMonthTotalMinutes: number;
  thisYearSessionCount: number;
  thisYearTotalMinutes: number;
  allSessionCount: number;
  allTotalMinutes: number;
}

export const SessionLogSummary: React.FC<SessionLogSummaryProps> = ({
  thisWeekSessionCount,
  thisWeekTotalMinutes,
  thisMonthSessionCount,
  thisMonthTotalMinutes,
  thisYearSessionCount,
  thisYearTotalMinutes,
  allSessionCount,
  allTotalMinutes,
}) => {
  return (
    <div className="mb-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            This Week
          </h3>
          <p className="text-lg font-bold text-primary">
            {thisWeekSessionCount} sessions
          </p>
          <p className="text-xs text-muted-foreground">
            ~ {formatDurationFromMinutes(thisWeekTotalMinutes)}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            This Month
          </h3>
          <p className="text-lg font-bold text-primary">
            {thisMonthSessionCount} sessions
          </p>
          <p className="text-xs text-muted-foreground">
            ~ {formatDurationFromMinutes(thisMonthTotalMinutes)}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            This Year
          </h3>
          <p className="text-lg font-bold text-primary">
            {thisYearSessionCount} sessions
          </p>
          <p className="text-xs text-muted-foreground">
            ~ {formatDurationFromMinutes(thisYearTotalMinutes)}
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
  );
};
