"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { settingsRegistry } from "@/infrastructure/config/appRegistry";
import { playSound } from "@/infrastructure/lib/utils";

interface SettingsPanelProps {
  initialTab?: string;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialTab = "background",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    playSound("/sounds/click.mp3");
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col items-center justify-start text-secondary h-full p-4">
      {" "}
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className=" grid grid-cols-2 gap-2">
          {settingsRegistry.map((setting) => (
            <TabsTrigger
              key={setting.id}
              value={setting.id}
              className="flex items-center min-w-fit gap-2 data-[state=active]:bg-accent data-[state=active]:text-white"
            >
              {setting.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsRegistry.map((setting) => (
          <TabsContent key={setting.id} value={setting.id}>
            <setting.component onClose={onClose} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
