"use client";

import React from "react";
import { useAtom } from "jotai";
import { openWindowAtom } from "@/application/atoms/windowAtoms";

export const CHANGELOG_WINDOW_ID = "changelog-window";

// This is the content component that will be rendered inside a window
export const ChangelogContent = () => {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full font-mono text-primary">
      <h2 className="text-xl font-bold">WFC OS</h2>
      <p className="text-sm text-muted-foreground">
        Recent updates and changes
      </p>

      <div className="space-y-4 mt-4">
        <div>
          <h3 className="text-lg font-semibold">Version 2.3</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <p className="font-bold underline">Timer</p>
            <li>Now timer can track your work sessions and productivity</li>
            <li>You can link a task to your work session</li>
            <p className="font-bold underline">Session Log</p>
            <li>You can see your sessions log as chart and table</li>
            <li>Chart show data of week, month, year</li>
            <li>Table show all your sessions data</li>
            <p className="font-bold underline">To-do List</p>
            <li>Show session count in task item</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Version 2.2.2</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <p className="font-bold underline">New Feature</p>
            <li>Added bookmark app</li>
            <li>Added sound effects settings</li>
            <p className="font-bold underline">To-do List</p>
            <li>Added edit task feature</li>
            <p className="font-bold underline">Notepad</p>
            <li>Implemented new text editor with rich text capabilities</li>
            <li>Support multiple notes</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Version 2.1</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <p className="font-bold underline">Stability & Performance</p>
            <li>Fixed window issues for smoother experience</li>
            <li>Optimized app performance when minimized</li>
            <p className="font-bold underline">Music & Audio</p>
            <li>Added on/off for sound effects</li>
            <li>Fixed error in music player</li>
            <li>Ambience player now can play on background</li>
            <p className="font-bold underline">Productivity Tools</p>
            <li>Fixed timer functionality</li>
            <li>Enhanced to-do list with improved task management</li>
            <p className="font-bold underline">System</p>
            <li>Refactored window system</li>
            <li>Implemented state persistence for all applications</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Version 2.0</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <p className="font-bold underline">Project in General</p>
            <li>
              Refactored and restructured codebase using layered architecture.
            </li>
            <li>Windows now minimize properly while apps continue running.</li>
            <li>Updated coding rules.</li>
            <p className="font-bold underline">Music Player</p>
            <li>Fixed bugs.</li>
            <li>Playback persists when minimized.</li>
            <li>Supports short playlists.</li>
            <p className="font-bold underline">To-do List</p>
            <li>Enabled sorting and moving tasks.</li>
            <p className="font-bold underline">Timer</p>
            <li>Fixed bugs.</li>
            <li>Runs reliably in the background.</li>
            <p className="font-bold underline">Settings:</p>
            <li>Added more wallpapers.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Version 1.5</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Added application registry for better app management</li>
            <li>Improved taskbar functionality</li>
            <li>Fixed multiple window handling bugs</li>
            <li>Enhanced accessibility features</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Version 1.0</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Initial release of WFC OS</li>
            <li>Basic window management</li>
            <li>Fundamental application support</li>
            <li>Core system interface implemented</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// This component manages the window state and provides a helper to open the changelog
export const ChangelogWindow = () => {
  // Use the content component directly
  return <ChangelogContent />;
};

// Custom hook for opening the changelog window
export const useOpenChangelog = () => {
  const openWindow = useAtom(openWindowAtom)[1];

  const openChangelog = () => {
    openWindow({
      id: CHANGELOG_WINDOW_ID,
      appId: "changelog",
      title: "Changelog",
      initialSize: { width: 500, height: 400 },
      minSize: { width: 300, height: 200 },
    });
  };

  return openChangelog;
};
