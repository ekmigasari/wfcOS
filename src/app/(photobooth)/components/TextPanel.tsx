"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Switch } from "@/presentation/components/ui/switch";
import { TEXT_COLORS, TEXT_FONTS } from "../constants/stickers";
import type { CaptionSettings, Decoration } from "../types/photobox";

const FontPicker = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (fontId: string) => void;
}) => (
  <div className="grid grid-cols-3 gap-1">
    {TEXT_FONTS.map((font) => (
      <button
        key={font.id}
        type="button"
        onClick={() => onChange(font.id)}
        className={cn(
          "truncate rounded border px-1 py-1 text-xs transition",
          value === font.id
            ? "border-accent bg-accent/10"
            : "border-black/10 bg-white hover:bg-black/5"
        )}
        style={{ fontFamily: font.css }}
      >
        {font.name}
      </button>
    ))}
  </div>
);

const ColorPicker = ({
  value,
  onChange,
  allowAuto,
}: {
  value: string | null | undefined;
  onChange: (color: string | null) => void;
  allowAuto?: boolean;
}) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {allowAuto && (
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "h-6 rounded-full border px-2 text-[10px] font-semibold",
          value === null ? "border-accent bg-accent/10" : "border-black/20"
        )}
      >
        Auto
      </button>
    )}
    {TEXT_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        title={color}
        onClick={() => onChange(color)}
        className={cn(
          "size-6 rounded-full border border-black/20 transition",
          value === color && "ring-2 ring-accent ring-offset-1"
        )}
        style={{ backgroundColor: color }}
      />
    ))}
    <label
      className="relative size-6 cursor-pointer overflow-hidden rounded-full border border-black/20 bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]"
      title="Custom color"
    >
      <input
        type="color"
        className="absolute inset-0 cursor-pointer opacity-0"
        value={value ?? "#000000"}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  </div>
);

const Label = ({ children }: { children: ReactNode }) => (
  <span className="text-xs font-semibold text-primary">{children}</span>
);

interface TextPanelProps {
  caption: CaptionSettings;
  onCaptionChange: (patch: Partial<CaptionSettings>) => void;
  selectedText: Decoration | null;
  onAddText: () => void;
  onTextChange: (patch: Partial<Decoration>) => void;
}

export const TextPanel = ({
  caption,
  onCaptionChange,
  selectedText,
  onAddText,
  onTextChange,
}: TextPanelProps) => (
  <div className="flex flex-col gap-4">
    <section className="flex flex-col gap-2">
      <h4 className="text-xs font-bold tracking-wide text-secondary uppercase">
        Frame caption
      </h4>
      <Input
        value={caption.text}
        maxLength={40}
        placeholder="Caption text"
        onChange={(event) => onCaptionChange({ text: event.target.value })}
        className="bg-white"
      />
      <div className="flex items-center justify-between">
        <Label>Show date</Label>
        <Switch
          checked={caption.showDate}
          onCheckedChange={(showDate) => onCaptionChange({ showDate })}
        />
      </div>
      <Label>Font</Label>
      <FontPicker
        value={caption.font}
        onChange={(font) => onCaptionChange({ font })}
      />
      <Label>Color</Label>
      <ColorPicker
        allowAuto
        value={caption.color}
        onChange={(color) => onCaptionChange({ color })}
      />
    </section>

    <section className="flex flex-col gap-2 border-t border-black/10 pt-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold tracking-wide text-secondary uppercase">
          Free text
        </h4>
        <Button size="sm" variant="outline" onClick={onAddText}>
          <Plus /> Add text
        </Button>
      </div>

      {selectedText ? (
        <>
          <textarea
            value={selectedText.content}
            rows={2}
            maxLength={120}
            onChange={(event) => onTextChange({ content: event.target.value })}
            className="w-full resize-none rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Label>Font</Label>
          <FontPicker
            value={selectedText.font}
            onChange={(font) => onTextChange({ font })}
          />
          <Label>Color</Label>
          <ColorPicker
            value={selectedText.color}
            onChange={(color) => onTextChange({ color: color ?? undefined })}
          />
        </>
      ) : (
        <p className="text-[11px] text-stone-500">
          Add a text box, or click one on the photo to edit it.
        </p>
      )}
    </section>
  </div>
);
