"use client";

import { useAtom } from "jotai";
import React from "react";

import { minimizedWindowsAtom } from "@/application/atoms/windowAtoms";
import { Menubar } from "@/presentation/components/ui/menubar";

import { MinimizedIcons } from "./MinimizedIcons";
import { TaskbarClock } from "./TaskbarClock";
import { TaskbarMenu } from "./TaskbarMenu";

export const Taskbar = () => {
  // Get minimized windows from state to check if we need to show icons
  const [minimizedWindows] = useAtom(minimizedWindowsAtom);
  const hasMinimizedWindows = minimizedWindows.length > 0;

  return (
    <>
      {/* Main menubar with logo, menu and clock */}
      <Menubar className="bg-primary border-secondary border-2 text-white relative justify-between">
        <TaskbarMenu />
        {/* Minimized icons display */}
        {hasMinimizedWindows && <MinimizedIcons />}
        <TaskbarClock />
      </Menubar>
    </>
  );
};
