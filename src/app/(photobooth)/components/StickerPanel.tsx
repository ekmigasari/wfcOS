"use client";

import { useState } from "react";
import { cn } from "@/infrastructure/lib/utils";
import { EMOJI_STICKERS, ICON_STICKERS } from "../constants/stickers";

interface StickerPanelProps {
  onAdd: (type: "emoji" | "icon", content: string) => void;
}

export const StickerPanel = ({ onAdd }: StickerPanelProps) => {
  const [tab, setTab] = useState<"emoji" | "icon">("emoji");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 rounded-md bg-black/5 p-1">
        {(
          [
            ["emoji", "Emoji"],
            ["icon", "WFC Icons"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 rounded px-2 py-1 text-xs font-semibold transition",
              tab === id ? "bg-white text-primary shadow-sm" : "text-stone-500"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "emoji" ? (
        <div className="grid grid-cols-6 gap-1">
          {EMOJI_STICKERS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onAdd("emoji", emoji)}
              className="rounded p-1 text-2xl transition hover:scale-110 hover:bg-black/5"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {ICON_STICKERS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => onAdd("icon", src)}
              className="flex items-center justify-center rounded p-1 transition hover:scale-110 hover:bg-black/5"
            >
              <img src={src} alt="" className="pb-pixelated size-10" />
            </button>
          ))}
        </div>
      )}
      <p className="text-[11px] text-stone-500">
        Click to add. Drag to move, use the blue handle to resize and rotate.
      </p>
    </div>
  );
};
