"use client";

import { useState } from "react";
import { cn } from "@/infrastructure/lib/utils";
import {
  EFFECT_CATEGORIES,
  type EffectCategory,
  getEffect,
  NO_EFFECT_ID,
  PHOTO_EFFECTS,
} from "../effects";

interface EffectPickerProps {
  value: string;
  onChange: (effectId: string) => void;
  className?: string;
}

export const EffectPicker = ({
  value,
  onChange,
  className,
}: EffectPickerProps) => {
  const [category, setCategory] = useState<EffectCategory>(
    getEffect(value)?.category ?? "props"
  );
  const effects = PHOTO_EFFECTS.filter(
    (effect) => effect.category === category
  );

  const chip = (id: string, icon: string, name: string) => (
    <button
      key={id}
      type="button"
      onClick={() => onChange(id)}
      className={cn(
        "flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-md border-2 p-1 transition",
        value === id
          ? "border-accent bg-accent/10"
          : "border-transparent hover:bg-black/5"
      )}
    >
      <span className="text-2xl leading-8">{icon}</span>
      <span className="line-clamp-2 w-full text-center text-[10px] leading-tight font-medium text-primary">
        {name}
      </span>
    </button>
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex justify-center gap-1">
        {EFFECT_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition",
              category === item.id
                ? "bg-secondary text-white"
                : "text-stone-500 hover:bg-black/5"
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="flex justify-center-safe gap-1 overflow-x-auto pb-1">
        {chip(NO_EFFECT_ID, "🚫", "None")}
        {effects.map((effect) => chip(effect.id, effect.icon, effect.name))}
      </div>
    </div>
  );
};
