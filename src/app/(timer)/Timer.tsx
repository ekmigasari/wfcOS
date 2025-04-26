"use client";

import { useAtom } from "jotai";
import { timerAtom } from "@/atoms/timerAtom";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import TimerSettings from "./components/TimerSettings";
import { GlobalTimer } from "./components/GlobalTimer";

export const Timer = () => {
  // Read full state directly from the atom
  const [timerState] = useAtom(timerAtom);

  return (
    <div className="flex flex-col items-center justify-between text-secondary h-full p-4">
      {/* Include the global timer component */}
      <GlobalTimer />

      {/* Timer Display Area */}
      <div className="flex flex-col items-center mb-6">
        <TimerDisplay
          timeRemaining={timerState.timeRemaining}
          timerSetting={timerState.timerSetting}
          customTitle={timerState.customTitle}
        />
        <TimerControls isRunning={timerState.isRunning} />
      </div>

      {/* Settings Area */}
      <TimerSettings
        timerSetting={timerState.timerSetting}
        customDurationMinutes={timerState.customDurationMinutes}
        customTitle={timerState.customTitle}
      />
    </div>
  );
};
