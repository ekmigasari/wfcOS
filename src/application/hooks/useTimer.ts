import { useAtom } from "jotai";
import {
  timerAtom,
  startPauseTimerAtom,
  resetTimerAtom,
  setTimerSettingAtom,
  setCustomDurationAtom,
  setCustomTitleAtom,
} from "@/application/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";

/**
 * Custom hook for managing timer state and actions.
 * Encapsulates Jotai atom logic for the Timer feature.
 */
export const useTimer = () => {
  const [timerState] = useAtom(timerAtom);
  const startPause = useAtom(startPauseTimerAtom)[1];
  const reset = useAtom(resetTimerAtom)[1];
  const setSetting = useAtom(setTimerSettingAtom)[1];
  const setCustomDuration = useAtom(setCustomDurationAtom)[1];
  const setCustomTitle = useAtom(setCustomTitleAtom)[1];

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

    // Actions (wrapped with sound)
    startPause: playSoundAnd(startPause),
    reset: playSoundAnd(reset),
    setSetting: playSoundAnd(setSetting),
    setCustomDuration: playSoundAnd(setCustomDuration),
    setCustomTitle: playSoundAnd(setCustomTitle),
  };
};
