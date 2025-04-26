"use client";

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
    <div className="taskbar-clock ml-auto mr-2 text-sm font-medium">
      {time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
    </div>
  );
};
