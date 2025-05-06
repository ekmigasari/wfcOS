"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/presentation/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { settingsRegistry } from "@/infrastructure/config/appRegistry";
import { Button } from "@/presentation/components/ui/button";
import { playSound } from "@/infrastructure/lib/utils";
import { X } from "lucide-react";

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

  const handleClose = () => {
    playSound("/sounds/click.mp3");
    onClose?.();
  };

  return (
    <Card className="w-full max-w-[95vw] sm:max-w-[500px] lg:max-w-none bg-card text-card-foreground border-none shadow-none">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleClose}
            title="Close"
          >
            <X size={16} />
          </Button>
        </div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            {settingsRegistry.map((setting) => (
              <TabsTrigger
                key={setting.id}
                value={setting.id}
                className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                <img
                  src={setting.icon}
                  alt={setting.name}
                  className="h-4 w-4"
                  onError={(e) => {
                    // If icon fails to load, hide it
                    e.currentTarget.style.display = "none";
                  }}
                />
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
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
