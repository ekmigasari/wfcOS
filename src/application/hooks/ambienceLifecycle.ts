import { isPlayingAtom } from "@/application/atoms/ambiencePlayerAtom";
import { JotaiSet } from "@/application/atoms/timerAtom";

/**
 * Ambience Player Lifecycle Handlers
 *
 * Provides lifecycle handlers for the ambience player application
 * to be registered in the appRegistry.
 */
const createAmbienceLifecycle = () => {
  /**
   * Handles ambience player window close
   * Pauses the sound when the window is closed
   */
  const handleClose = (set: JotaiSet, windowId: string) => {
    console.log(`[Ambience] Window ${windowId} closed, pausing sound`);
    // Set isPlaying to false when window is closed
    set(isPlayingAtom, false);
  };

  /**
   * Handles ambience player window minimize
   * This is a placeholder - we don't modify playback on minimize
   */
  const handleMinimize = (
    set: JotaiSet,
    windowId: string,
    isMinimized: boolean
  ) => {
    console.log(
      `[Ambience] Window ${windowId} ${isMinimized ? "minimized" : "restored"}`
    );
    // We don't pause/modify playback when the window is minimized
  };

  return {
    handleClose,
    handleMinimize,
  };
};

// Export singleton instance of the lifecycle handlers
export const ambienceLifecycle = createAmbienceLifecycle();
