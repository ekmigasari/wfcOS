import { Session } from "@/application/types/session.types";
import { TaskItem } from "@/application/atoms/todoListAtom";

// Helper function to format duration from minutes to hours and minutes
export const formatDurationFromMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (hours > 0) {
    result += `${hours}h `;
  }
  result += `${minutes}m`;
  return result.trim() || "0m";
};

// Helper functions for chart data
export const getWeeklyChartData = (
  currentSessions: Session[],
  offset: number
): { name: string; sessions: number }[] => {
  const data: { name: string; sessions: number }[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + offset * 7);

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  });

  const targetSunday = new Date(baseDate);
  targetSunday.setDate(baseDate.getDate() - baseDate.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(targetSunday);
    date.setDate(targetSunday.getDate() + i);

    const dateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const sessionsOnDate = currentSessions.filter(
      (s) => s.date === dateString
    ).length;
    data.push({
      name: dayFormatter.format(date),
      sessions: sessionsOnDate,
    });
  }
  return data;
};

export const getMonthlyChartData = (
  currentSessions: Session[],
  offset: number
): { name: string; sessions: number }[] => {
  const targetDate = new Date();
  targetDate.setDate(1);
  targetDate.setMonth(targetDate.getMonth() + offset);

  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const sessionsThisMonth = currentSessions.filter((s) => {
    const [year, month] = s.date.split("-").map(Number);
    return year === targetYear && month - 1 === targetMonth;
  });

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const numWeeks = Math.ceil(daysInMonth / 7);
  const weeklyData: { name: string; sessions: number }[] = Array.from(
    { length: numWeeks },
    (_, i) => ({
      name: `Week ${i + 1}`,
      sessions: 0,
    })
  );

  sessionsThisMonth.forEach((s) => {
    const dayOfMonth = parseInt(s.date.split("-")[2], 10);
    const weekIndex = Math.ceil(dayOfMonth / 7) - 1;
    if (weekIndex >= 0 && weekIndex < numWeeks) {
      weeklyData[weekIndex].sessions++;
    }
  });
  return weeklyData;
};

export const getYearlyChartData = (
  currentSessions: Session[],
  offset: number
): { name: string; sessions: number }[] => {
  const targetYear = new Date().getFullYear() + offset;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData: { name: string; sessions: number }[] = monthNames.map(
    (name) => ({
      name,
      sessions: 0,
    })
  );

  currentSessions.forEach((s) => {
    const [year, monthStr] = s.date.split("-");
    const sessionYear = parseInt(year, 10);
    const sessionMonth = parseInt(monthStr, 10) - 1;

    if (sessionYear === targetYear && sessionMonth >= 0 && sessionMonth < 12) {
      monthlyData[sessionMonth].sessions++;
    }
  });
  return monthlyData;
};

export const getTaskName = (
  taskId: string | null,
  allTasks: TaskItem[]
): string => {
  if (!taskId) return "N/A";
  const task = allTasks.find((t: TaskItem) => t.id === taskId);
  return task ? task.content : "Deleted Task";
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
