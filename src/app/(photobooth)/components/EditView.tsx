"use client";

import { useAtom } from "jotai";
import { Camera, Eraser, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  photoboxDecorationsAtom,
  photoboxPhotosAtom,
  photoboxSettingsAtom,
} from "@/application/atoms/photoboxAtom";
import { Button } from "@/presentation/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { getFilter } from "../constants/filters";
import { getFrame } from "../constants/frames";
import { getLayout } from "../constants/layouts";
import { fitAspect, useElementSize } from "../hooks/useElementSize";
import type { Decoration } from "../types/photobox";
import { renderComposite } from "../utils/renderComposite";
import { DecorationLayer } from "./DecorationLayer";
import { FilterPicker } from "./FilterPicker";
import { FramePanel } from "./FramePanel";
import { StickerPanel } from "./StickerPanel";
import { TextPanel } from "./TextPanel";

const createId = () =>
  `deco_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

interface EditViewProps {
  onBack: () => void;
  onPrint: () => void;
}

export const EditView = ({ onBack, onPrint }: EditViewProps) => {
  const [settings, setSettings] = useAtom(photoboxSettingsAtom);
  const [photos] = useAtom(photoboxPhotosAtom);
  const [decorations, setDecorations] = useAtom(photoboxDecorationsAtom);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("stickers");
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const layout = getLayout(settings.layoutId);
  const filter = getFilter(settings.filterId);
  const frame = getFrame(settings.frameId);
  const display = fitAspect(stageSize, layout.width / layout.height);

  // Re-render the base print (photos, frame, caption) whenever inputs change.
  // Decorations are DOM elements on top so they can be dragged smoothly.
  useEffect(() => {
    if (!display.width) return;
    let cancelled = false;
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(1, (display.width * dpr) / layout.width);

    void renderComposite({
      layout,
      photos,
      filter,
      frame,
      caption: settings.caption,
      scale,
      showPlaceholders: true,
    }).then((rendered) => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      canvas.getContext("2d")?.drawImage(rendered, 0, 0);
    });

    return () => {
      cancelled = true;
    };
  }, [layout, photos, filter, frame, settings.caption, display.width]);

  const updateDecoration = (id: string, patch: Partial<Decoration>) =>
    setDecorations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );

  const removeDecoration = (id: string) => {
    setDecorations((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  };

  // New items land near the center with a little jitter so they don't stack exactly
  const addDecoration = (
    item: Omit<Decoration, "id" | "x" | "y" | "rotation">
  ) => {
    const id = createId();
    const jitter = () => (Math.random() - 0.5) * 0.15;
    setDecorations((prev) => [
      ...prev,
      { ...item, id, x: 0.5 + jitter(), y: 0.4 + jitter(), rotation: 0 },
    ]);
    setSelectedId(id);
  };

  const selected = decorations.find((item) => item.id === selectedId) ?? null;
  const selectedText = selected?.type === "text" ? selected : null;

  // Delete key removes the selected item (unless typing in a field)
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!selectedId) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        removeDecoration(selectedId);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 @3xl:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div
          ref={stageRef}
          className="flex min-h-[240px] flex-1 items-center justify-center"
        >
          <div
            className="relative shadow-xl"
            style={{ width: display.width, height: display.height }}
          >
            <canvas ref={canvasRef} className="block h-full w-full" />
            <DecorationLayer
              items={decorations}
              width={display.width}
              height={display.height}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                const item = decorations.find((d) => d.id === id);
                if (item?.type === "text") setTab("text");
              }}
              onChange={updateDecoration}
              onRemove={removeDecoration}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={onBack}>
            <Camera /> Back to camera
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={decorations.length === 0}
            onClick={() => {
              setDecorations([]);
              setSelectedId(null);
            }}
          >
            <Eraser /> Clear stickers
          </Button>
          <Button
            size="sm"
            className="bg-accent text-white hover:bg-accent/90"
            onClick={() => {
              setSelectedId(null);
              onPrint();
            }}
          >
            <Printer /> Print
          </Button>
        </div>
      </div>

      <aside className="flex min-h-0 shrink-0 flex-col @3xl:w-72">
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 bg-black/5">
            <TabsTrigger value="stickers">Stickers</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="filter">Filter</TabsTrigger>
            <TabsTrigger value="frame">Frame</TabsTrigger>
          </TabsList>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
            <TabsContent value="stickers">
              <StickerPanel
                onAdd={(type, content) =>
                  addDecoration({
                    type,
                    content,
                    size: type === "emoji" ? 0.14 : 0.16,
                  })
                }
              />
            </TabsContent>
            <TabsContent value="text">
              <TextPanel
                caption={settings.caption}
                onCaptionChange={(patch) =>
                  setSettings({ caption: { ...settings.caption, ...patch } })
                }
                selectedText={selectedText}
                onAddText={() =>
                  addDecoration({
                    type: "text",
                    content: "Hello!",
                    size: 0.08,
                    font: "fun",
                    color: "#e11d48",
                  })
                }
                onTextChange={(patch) =>
                  selectedText && updateDecoration(selectedText.id, patch)
                }
              />
            </TabsContent>
            <TabsContent value="filter">
              <FilterPicker
                className="flex-wrap overflow-visible"
                value={settings.filterId}
                samplePhoto={photos.find(Boolean) ?? null}
                onChange={(filterId) => setSettings({ filterId })}
              />
            </TabsContent>
            <TabsContent value="frame">
              <FramePanel
                value={settings.frameId}
                onChange={(frameId) => setSettings({ frameId })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </aside>
    </div>
  );
};
