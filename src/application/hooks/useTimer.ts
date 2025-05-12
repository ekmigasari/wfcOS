import { useAtom } from "jotai";
import {
  timerAtom,
  startPauseTimerAtom,
  resetTimerAtom,
  setTimerSettingAtom,
  setCustomDurationAtom,
  setCustomTitleAtom,
  restartAndGoAtom,
} from "@/application/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";

/**
 * Custom hook for managing timer state and actions.
 * Encapsulates Jotai atom logic for the Timer feature.
 */
export const useTimer = () => {
  const [timerState] = useAtom(timerAtom);
  const [, doStartPause] = useAtom(startPauseTimerAtom);
  const [, doReset] = useAtom(resetTimerAtom);
  const [, doSetSetting] = useAtom(setTimerSettingAtom);
  const [, doSetCustomDuration] = useAtom(setCustomDurationAtom);
  const [, doSetCustomTitle] = useAtom(setCustomTitleAtom);
  const [, doRestartAndGo] = useAtom(restartAndGoAtom);

  // Wrap actions with UI sound feedback
  const playSoundAnd = <Args extends unknown[], Res>(
    action: (...args: Args) => Res
  ) => {
    return (...args: Args): Res => {
      playSound("/sounds/click.mp3");
      return action(...args);
    };
  };

  return {
    // State
    timeRemaining: timerState.timeRemaining,
    isRunning: timerState.isRunning,
    timerSetting: timerState.timerSetting,
    customDurationMinutes: timerState.customDurationMinutes,
    customTitle: timerState.customTitle,
    workCycleDuration: timerState.workCycleDuration ?? 0,

    // Actions (wrapped with sound)
    startPause: playSoundAnd(doStartPause),
    reset: playSoundAnd(doReset),
    setSetting: playSoundAnd(doSetSetting),
    setCustomDuration: playSoundAnd(doSetCustomDuration),
    setCustomTitle: playSoundAnd(doSetCustomTitle),
    restart: playSoundAnd(doRestartAndGo),
  };
};
