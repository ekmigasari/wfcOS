"use client";

import { useAtom } from "jotai";
import { timerAtom } from "@/application/atoms/timerAtom";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import TimerSettings from "./components/TimerSettings";

export const Timer = () => {
  // Read full state directly from the atom
  const [timerState] = useAtom(timerAtom);

  return (
    <div className="flex flex-col items-center justify-start text-secondary h-full p-4">
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

      {/* Show minimized state indicator based on atom state */}
      {timerState.isMinimized && (
        <div className="text-xs mt-2 text-green-500">
          Timer will continue running when window is minimized
        </div>
      )}
    </div>
  );
};
