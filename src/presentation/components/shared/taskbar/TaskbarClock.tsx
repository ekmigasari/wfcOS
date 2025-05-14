"use client";

import { Coffee } from "lucide-react";
import React, { useEffect,useState } from "react";

import { Button } from "../../ui/button";
import { SoundToggle } from "./SoundToggle";

export const TaskbarClock = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time once client-side
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taskbar-clock ml-auto flex items-center gap-3">
      <div className="flex items-center space-x-1">
        <SoundToggle />
        <a
          href="https://ko-fi.com/workfromcoffee"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Buy me a coffee"
          >
            <Coffee size={16} />
          </Button>
        </a>
      </div>
      <div className="taskbar-clock ml-auto mr-2 text-sm font-medium whitespace-nowrap uppercase">
        {time
          ? time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : ""}
      </div>
    </div>
  );
};
