"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  TimerSetting,
  setTimerSettingAtom,
  setCustomDurationAtom,
  setCustomTitleAtom,
} from "@/atoms/timerAtom";
import { playSound } from "@/infrastructure/lib/utils";

interface TimerSettingsProps {
  timerSetting: TimerSetting;
  customDurationMinutes: number;
  customTitle: string;
}

export const TimerSettings = ({
  timerSetting,
  customDurationMinutes,
  customTitle,
}: TimerSettingsProps) => {
  const setSetting = useAtom(setTimerSettingAtom)[1];
  const setCustomTime = useAtom(setCustomDurationAtom)[1];
  const setCustomName = useAtom(setCustomTitleAtom)[1];

  // Local state for the custom input fields
  const [localCustomMinutes, setLocalCustomMinutes] = useState<string>(
    customDurationMinutes.toString()
  );
  const [localCustomTitle, setLocalCustomTitle] = useState<string>(customTitle);

  // Update local state when global state changes
  useEffect(() => {
    setLocalCustomMinutes(customDurationMinutes.toString());
    setLocalCustomTitle(customTitle);
  }, [customDurationMinutes, customTitle]);

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSetting = event.target.value as TimerSetting;
    playSound("/sounds/click.mp3");
    setSetting(newSetting);
  };

  const handleCustomTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalCustomMinutes(event.target.value);
  };

  const handleCustomTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalCustomTitle(event.target.value);
  };

  const updateGlobalCustomTime = () => {
    const newMinutes = parseInt(localCustomMinutes, 10);
    if (!isNaN(newMinutes) && newMinutes !== customDurationMinutes) {
      setCustomTime(newMinutes);
      playSound("/sounds/click.mp3");
    } else if (isNaN(newMinutes)) {
      setLocalCustomMinutes(customDurationMinutes.toString());
    }
  };

  const updateGlobalCustomTitle = () => {
    if (localCustomTitle !== customTitle) {
      setCustomName(localCustomTitle);
      playSound("/sounds/click.mp3");
    }
  };

  const handleCustomTimeKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      updateGlobalCustomTime();
      (event.target as HTMLInputElement).blur();
    }
  };

  const handleCustomTitleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      updateGlobalCustomTitle();
      (event.target as HTMLInputElement).blur();
    }
  };

  // Timer setting options with descriptive labels
  const durationOptions: {
    value: TimerSetting;
    label: string;
    description: string;
  }[] = [
    {
      value: "work25",
      label: "Work (25min)",
      description: "Focus time for maximum productivity",
    },
    {
      value: "short4",
      label: "Short Break (4min)",
      description: "Quick refreshment between work sessions",
    },
    {
      value: "long15",
      label: "Long Break (15min)",
      description: "Extended rest after multiple work sessions",
    },
    {
      value: "custom",
      label: "Custom Timer",
      description: "Set your own timer duration and title",
    },
  ];

  return (
    <div className="w-full border-t pt-4">
      <h3 className="text-sm font-medium mb-2 text-center">Timer Settings</h3>
      <div className="flex flex-col gap-2">
        {durationOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-start p-2 cursor-pointer rounded hover:bg-gray-100"
          >
            <input
              type="radio"
              name="timerSetting"
              value={option.value}
              checked={timerSetting === option.value}
              onChange={handleSettingChange}
              className="mt-1 mr-2"
            />
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>

              {/* Custom settings inputs */}
              {option.value === "custom" && timerSetting === "custom" && (
                <div className="flex flex-col mt-2 space-y-2">
                  <div className="flex items-center">
                    <span className="text-xs w-16">Minutes:</span>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={localCustomMinutes}
                      onChange={handleCustomTimeChange}
                      onBlur={updateGlobalCustomTime}
                      onKeyDown={handleCustomTimeKeyDown}
                      className="w-16 px-2 py-1 text-sm bg-white border rounded"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-16">Title:</span>
                    <input
                      type="text"
                      value={localCustomTitle}
                      onChange={handleCustomTitleChange}
                      onBlur={updateGlobalCustomTitle}
                      onKeyDown={handleCustomTitleKeyDown}
                      maxLength={20}
                      className="w-full px-2 py-1 text-sm bg-white border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TimerSettings;
