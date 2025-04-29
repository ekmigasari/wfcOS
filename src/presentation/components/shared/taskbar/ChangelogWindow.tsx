"use client";

import React from "react";
import { Window } from "@/presentation/components/shared/window/Window";
import { useAtom } from "jotai";
import {
  closeWindowAtom,
  windowRegistryAtom,
} from "@/application/atoms/windowAtoms";

export const CHANGELOG_WINDOW_ID = "changelog-window";

export const ChangelogWindow = () => {
  const [windowRegistry] = useAtom(windowRegistryAtom);
  const closeWindow = useAtom(closeWindowAtom)[1];

  // Check if the changelog window exists and is open
  const changelogWindow = windowRegistry[CHANGELOG_WINDOW_ID];
  const isOpen = changelogWindow?.isOpen || false;
  const isMinimized = changelogWindow?.isMinimized || false;
  const zIndex = changelogWindow?.zIndex || 1000;
  const position = changelogWindow?.position || { x: 100, y: 100 };
  const size = changelogWindow?.size || { width: 500, height: 400 };

  // Handle closing the window
  const handleClose = () => {
    closeWindow(CHANGELOG_WINDOW_ID);
  };

  if (!isOpen) return null;

  return (
    <Window
      windowId={CHANGELOG_WINDOW_ID}
      title="Changelog"
      onClose={handleClose}
      initialSize={size}
      initialPosition={position}
      minSize={{ width: 300, height: 200 }}
      isOpen={isOpen}
      isMinimized={isMinimized}
      zIndex={zIndex}
    >
      <div className="p-4 space-y-4 overflow-y-auto h-full font-mono text-primary">
        <h2 className="text-xl font-bold">WFC OS</h2>
        <p className="text-sm text-muted-foreground">
          Recent updates and changes
        </p>
        <p className="text-sm text-muted-foreground">
          Feel free to mention @ekmigasari on X or open an issue on the repo if
          you have any feedback!
        </p>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold">Version 2.0</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <p className="font-bold underline">Project in General</p>
              <li>
                Refactored and restructured codebase using layered architecture.
              </li>
              <li>
                Windows now minimize properly while apps continue running.
              </li>
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
    </Window>
  );
};
