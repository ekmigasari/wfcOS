"use client";

import { TimerSetting } from "@/application/atoms/timerAtom";
import { formatTime, getDisplayTitle } from "../utils/timerUtils";

interface TimerDisplayProps {
  timeRemaining: number;
  timerSetting: TimerSetting;
  customTitle: string;
}

export const TimerDisplay = ({
  timeRemaining,
  timerSetting,
  customTitle,
}: TimerDisplayProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">
        {getDisplayTitle(timerSetting, customTitle)}
      </h2>
      <div className="text-6xl font-mono mb-4 tabular-nums">
        {formatTime(timeRemaining)}
      </div>
    </>
  );
};

export default TimerDisplay;
