"use client";

import { Coffee } from "lucide-react";
import React, { useState, useEffect } from "react";

export const TaskbarClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taskbar-clock ml-auto flex items-center gap-2">
      <div className="flex items-center space-x-1">
        <a
          href="https://ko-fi.com/workfromcoffee"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
          title="Buy me a coffee"
        >
          <Coffee size={16} />
        </a>
      </div>
      <div className="taskbar-clock ml-auto mr-2 text-sm font-medium">
        {time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </div>
    </div>
  );
};
