"use client";

import { useState, useEffect } from "react";
import { TimerSetting } from "@/application/atoms/timerAtom";
import { Button } from "@/presentation/components/ui/button";
import { ListCollapse } from "lucide-react";
import { useSetAtom } from "jotai";
import { openWindowAtom } from "@/application/atoms/windowAtoms";
import { appRegistry } from "@/infrastructure/config/appRegistry";

interface TimerSettingsProps {
  timerSetting: TimerSetting;
  customDurationMinutes: number;
  customTitle: string;
  onSetSetting: (setting: TimerSetting) => void;
  onSetCustomDuration: (minutes: number) => void;
  onSetCustomTitle: (title: string) => void;
}

export const TimerSettings = ({
  timerSetting,
  customDurationMinutes,
  customTitle,
  onSetSetting,
  onSetCustomDuration,
  onSetCustomTitle,
}: TimerSettingsProps) => {
  const [localCustomMinutes, setLocalCustomMinutes] = useState<string>(
    customDurationMinutes.toString()
  );
  const [localCustomTitle, setLocalCustomTitle] = useState<string>(customTitle);
  const openWindow = useSetAtom(openWindowAtom);

  useEffect(() => {
    setLocalCustomMinutes(customDurationMinutes.toString());
    setLocalCustomTitle(customTitle);
  }, [customDurationMinutes, customTitle]);

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSetting = event.target.value as TimerSetting;
    onSetSetting(newSetting);
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
      onSetCustomDuration(newMinutes);
    } else if (isNaN(newMinutes)) {
      setLocalCustomMinutes(customDurationMinutes.toString());
    }
  };

  const updateGlobalCustomTitle = () => {
    if (localCustomTitle !== customTitle) {
      onSetCustomTitle(localCustomTitle);
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

  const handleOpenSessionLog = () => {
    const appConfig = appRegistry.sessionLog;
    if (appConfig) {
      openWindow({
        id: "sessionLog",
        appId: "sessionLog",
        title: appConfig.name,
        initialSize: appConfig.defaultSize,
        minSize: appConfig.minSize,
      });
    }
  };

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
      value: "short5",
      label: "Short Break (5min)",
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

      {/* Session Log Button */}
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleOpenSessionLog}
        >
          <ListCollapse className="mr-2 h-4 w-4" />
          View Session Log
        </Button>
      </div>
    </div>
  );
};

export default TimerSettings;
