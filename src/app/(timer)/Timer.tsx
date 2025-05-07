"use client";

import { useTimer } from "@/application/hooks/useTimer";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import TimerSettings from "./components/TimerSettings";
import TimerManager from "./TimerManager";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { resetTimerAtom } from "@/application/atoms/timerAtom";
import {
  selectedTaskForTimerAtom,
  sortedSessionsAtom,
} from "@/application/atoms/sessionAtoms";
import {
  incompleteTasksAtom,
  TaskItem,
} from "@/application/atoms/todoListAtom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import ActivitySummary from "./components/ActivitySummary";
import {
  calculateCurrentMonthSessions,
  calculateDayStreak,
} from "@/app/(session-log)/sessionLogUtils";
import { Session } from "@/application/types/session.types";

export const Timer = () => {
  // Use the timer hook for state and actions
  const {
    timeRemaining,
    isRunning,
    timerSetting,
    customDurationMinutes,
    customTitle,
    startPause,
    reset,
    setSetting,
    setCustomDuration,
    setCustomTitle,
  } = useTimer();

  // Direct access to reset atom to avoid sound conflicts
  const [, silentReset] = useAtom(resetTimerAtom);
  const incompleteTasks = useAtomValue(incompleteTasksAtom);
  const [selectedTaskId, setSelectedTaskId] = useAtom(selectedTaskForTimerAtom);
  const sessions = useAtomValue(sortedSessionsAtom);
  const currentDate = new Date();

  // Reset timer when component mounts (reopens)
  useEffect(() => {
    // Use silent reset to avoid sound conflict errors
    silentReset();
  }, [silentReset]);

  // Calculate data for ActivitySummary
  const localTodayDateString = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  const todaySessions = sessions.filter(
    (s: Session) => s.date === localTodayDateString
  );
  const todaySessionCount = todaySessions.length;
  const todayTotalMinutes = todaySessions.reduce(
    (acc: number, s: Session) => acc + (s.duration || 25),
    0
  );

  const currentStreak = calculateDayStreak(sessions, currentDate);
  const { count: thisMonthSessionCount, totalMinutes: thisMonthTotalMinutes } =
    calculateCurrentMonthSessions(sessions, currentDate);

  const activitySummaryData = {
    todaySessionCount,
    todayTotalMinutes,
    currentStreak,
    thisMonthSessionCount,
    thisMonthTotalMinutes,
  };

  return (
    <div className="flex flex-col items-center justify-start text-secondary h-full p-4">
      {/* Timer worker manager (invisible) */}
      <TimerManager />

      {/* Timer Display Area */}
      <div className="flex flex-col items-center mb-6">
        <TimerDisplay
          timeRemaining={timeRemaining}
          timerSetting={timerSetting}
          customTitle={customTitle}
        />

        {/* Timer controls */}
        <TimerControls
          isRunning={isRunning}
          onStartPause={startPause}
          onReset={reset}
        />

        {/* Task Selector */}
        <div className="my-4 w-full max-w-xs">
          <Select
            value={selectedTaskId || ""}
            onValueChange={(value) =>
              setSelectedTaskId(value === "none" ? null : value)
            }
            disabled={isRunning}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Link a task (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No task selected</SelectItem>
              {incompleteTasks.map((task: TaskItem) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.content}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Activity Summary Display */}
      <ActivitySummary {...activitySummaryData} />

      {/* Settings Area */}
      <TimerSettings
        timerSetting={timerSetting}
        customDurationMinutes={customDurationMinutes}
        customTitle={customTitle}
        onSetSetting={setSetting}
        onSetCustomDuration={setCustomDuration}
        onSetCustomTitle={setCustomTitle}
      />
    </div>
  );
};

export default Timer;
