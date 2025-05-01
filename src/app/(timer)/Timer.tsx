"use client";

import { useTimer } from "@/application/hooks/useTimer";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import TimerSettings from "./components/TimerSettings";
import TimerManager from "./TimerManager";

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
      </div>

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
