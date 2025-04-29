import { TimerSetting } from "@/application/atoms/timerAtom";

// Format time as MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Get the display title based on setting
export const getDisplayTitle = (
  timerSetting: TimerSetting,
  customTitle: string
): string => {
  if (timerSetting === "custom") {
    return customTitle;
  }

  switch (timerSetting) {
    case "work25":
      return "Work";
    case "short5":
      return "Short Break";
    case "long15":
      return "Long Break";
    default:
      return "Timer";
  }
};
