"use client";

import { useAtom } from "jotai";
import { FlipHorizontal, Printer, Square, Upload, Wand2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  photoboxPhotosAtom,
  photoboxSettingsAtom,
} from "@/application/atoms/photoboxAtom";
import { cn } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import { getFilter } from "../constants/filters";
import { getLayout } from "../constants/layouts";
import { getEffect } from "../effects";
import { applyEffectToPhoto } from "../effects/applyToPhoto";
import { useCamera } from "../hooks/useCamera";
import { useCaptureSequence } from "../hooks/useCaptureSequence";
import { useEffectRenderer } from "../hooks/useEffectRenderer";
import { fitAspect, useElementSize } from "../hooks/useElementSize";
import {
  captureVideoFrame,
  fileToPhoto,
  forgetImage,
} from "../utils/renderComposite";
import { CameraView } from "./CameraView";
import { EffectPicker } from "./EffectPicker";
import { FilterPicker } from "./FilterPicker";
import { LayoutPicker } from "./LayoutPicker";
import { SlotTray } from "./SlotTray";

const COUNTDOWN_OPTIONS = [3, 5, 10];

interface CaptureViewProps {
  cameraActive: boolean;
  onEdit: () => void;
  onPrint: () => void;
}

export const CaptureView = ({
  cameraActive,
  onEdit,
  onPrint,
}: CaptureViewProps) => {
  const [settings, setSettings] = useAtom(photoboxSettingsAtom);
  const [photos, setPhotos] = useAtom(photoboxPhotosAtom);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [uploadTarget, setUploadTarget] = useState<number | "fill" | null>(
    null
  );
  const [lookTab, setLookTab] = useState<"filters" | "effects">("effects");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();

  const layout = getLayout(settings.layoutId);
  const filter = getFilter(settings.filterId);
  const slotCount = layout.slots.length;
  const effect = getEffect(settings.effectId);
  const { videoRef, status, retry } = useCamera(cameraActive);
  const effectRenderer = useEffectRenderer(
    videoRef,
    effect,
    settings.mirror,
    cameraActive && status === "ready"
  );

  const setPhotoAt = useCallback(
    (index: number, photo: string | null) => {
      setPhotos((prev) => {
        const next = Array.from(
          { length: slotCount },
          (_, i) => prev[i] ?? null
        );
        const old = next[index];
        if (old && old !== photo) forgetImage(old);
        next[index] = photo;
        return next;
      });
    },
    [setPhotos, slotCount]
  );

  const capture = useCallback(
    (slotIndex: number) => {
      // With an effect on, the effect canvas already holds the mirrored, decorated frame
      const effectCanvas = effectRenderer.canvasRef.current;
      const video = videoRef.current;
      const photo =
        effect && effectCanvas?.width
          ? effectCanvas.toDataURL("image/jpeg", 0.9)
          : video
            ? captureVideoFrame(video, settings.mirror)
            : null;
      if (!photo) return false;
      setPhotoAt(slotIndex, photo);
      return true;
    },
    [videoRef, effect, effectRenderer.canvasRef, settings.mirror, setPhotoAt]
  );

  const sequence = useCaptureSequence(settings.countdown, capture);
  const cameraReady = status === "ready";
  const filledCount = layout.slots.filter((_, i) => photos[i]).length;
  const hasEmptyAndFilled = filledCount > 0 && filledCount < slotCount;

  const handleShutter = () => {
    if (sequence.isRunning) {
      sequence.cancel();
      return;
    }
    const targets = layout.slots
      .map((_, i) => i)
      .filter((i) => !hasEmptyAndFilled || !photos[i]);
    setSelectedSlot(null);
    void sequence.start(targets);
  };

  const openUpload = (target: number | "fill") => {
    setUploadTarget(target);
    const input = fileInputRef.current;
    if (!input) return;
    input.multiple = target === "fill";
    input.click();
  };

  const prepareUpload = async (file: File) => {
    const photo = await fileToPhoto(file);
    return effect ? applyEffectToPhoto(photo, effect) : photo;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploadTarget === null) return;
    const list = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    try {
      if (typeof uploadTarget === "number") {
        setPhotoAt(uploadTarget, await prepareUpload(list[0]));
      } else {
        // Fill empty slots first, then overwrite from the start
        const empty = layout.slots.map((_, i) => i).filter((i) => !photos[i]);
        const order = [...empty, ...layout.slots.map((_, i) => i)].filter(
          (value, i, arr) => arr.indexOf(value) === i
        );
        for (let i = 0; i < Math.min(list.length, order.length); i++) {
          setPhotoAt(order[i], await prepareUpload(list[i]));
        }
      }
    } catch (error) {
      console.error("Photobox upload failed", error);
    } finally {
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const changeLayout = (layoutId: string) => {
    setSettings({ layoutId });
    setSelectedSlot(null);
  };

  const shotSlot = sequence.activeSlot ?? selectedSlot ?? 0;
  const slotRect = layout.slots[shotSlot] ?? layout.slots[0];
  const cameraBox = fitAspect(stageSize, slotRect.w / slotRect.h);
  const shotLabel =
    sequence.activeSlot !== null
      ? `Shot ${sequence.activeSlot + 1} / ${slotCount}`
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 @3xl:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div
          ref={stageRef}
          className="flex min-h-[200px] flex-1 items-center justify-center"
        >
          <div style={{ width: cameraBox.width, height: cameraBox.height }}>
            <CameraView
              videoRef={videoRef}
              status={status}
              filter={filter}
              mirror={settings.mirror}
              countdown={sequence.countdown}
              flashKey={sequence.flashKey}
              shotLabel={shotLabel}
              onRetry={retry}
              onUpload={() => openUpload("fill")}
              effectCanvasRef={effectRenderer.canvasRef}
              effectActive={Boolean(effect)}
              needsFace={effect?.needsFace ?? false}
              trackerStatus={effectRenderer.trackerStatus}
              faceCount={effectRenderer.faceCount}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1 rounded-md bg-white/70 p-1">
            {COUNTDOWN_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                disabled={sequence.isRunning}
                onClick={() => setSettings({ countdown: seconds })}
                className={cn(
                  "rounded px-2 py-1 text-xs font-semibold transition",
                  settings.countdown === seconds
                    ? "bg-secondary text-white"
                    : "text-primary hover:bg-black/5"
                )}
              >
                {seconds}s
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleShutter}
            disabled={!cameraReady && !sequence.isRunning}
            title={sequence.isRunning ? "Stop" : "Start"}
            className={cn(
              "flex size-16 items-center justify-center rounded-full border-4 border-white shadow-lg ring-2 transition active:scale-95 disabled:opacity-40",
              sequence.isRunning
                ? "bg-stone-700 ring-stone-700"
                : "bg-red-500 ring-red-500 hover:bg-red-600"
            )}
          >
            {sequence.isRunning ? (
              <Square className="size-6 fill-white text-white" />
            ) : (
              <span className="text-[10px] font-bold tracking-wide text-white">
                {hasEmptyAndFilled
                  ? "FILL"
                  : filledCount === slotCount
                    ? "AGAIN"
                    : "START"}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className={cn(settings.mirror && "bg-accent/15")}
              onClick={() => setSettings({ mirror: !settings.mirror })}
              title="Mirror preview"
            >
              <FlipHorizontal /> Mirror
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={sequence.isRunning}
              onClick={() => openUpload("fill")}
              title="Upload photos into the slots"
            >
              <Upload /> Upload
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-center">
            <div className="flex gap-1 rounded-md bg-black/5 p-1">
              {(
                [
                  ["effects", "✨ Effects"],
                  ["filters", "🎨 Filters"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLookTab(id)}
                  className={cn(
                    "rounded px-3 py-0.5 text-xs font-semibold transition",
                    lookTab === id
                      ? "bg-white text-primary shadow-sm"
                      : "text-stone-500"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {lookTab === "effects" ? (
            <EffectPicker
              value={settings.effectId}
              onChange={(effectId) => setSettings({ effectId })}
            />
          ) : (
            <FilterPicker
              className="justify-center-safe"
              value={settings.filterId}
              samplePhoto={photos.find(Boolean) ?? null}
              onChange={(filterId) => setSettings({ filterId })}
            />
          )}
        </div>
      </div>

      <aside className="flex min-h-0 shrink-0 flex-col gap-3 @3xl:w-64">
        <section className="shrink-0">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-secondary uppercase">
            Layout
          </h3>
          <LayoutPicker
            value={settings.layoutId}
            disabled={sequence.isRunning}
            onChange={changeLayout}
          />
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-secondary uppercase">
            Shots {filledCount}/{slotCount}
          </h3>
          <SlotTray
            layout={layout}
            photos={photos}
            filter={filter}
            selectedSlot={selectedSlot}
            activeSlot={sequence.activeSlot}
            disabled={sequence.isRunning}
            canShoot={cameraReady}
            onSelect={setSelectedSlot}
            onRetake={(index) => {
              setSelectedSlot(index);
              void sequence.start([index]);
            }}
            onUpload={(index) => openUpload(index)}
            onClear={(index) => setPhotoAt(index, null)}
          />
          <p className="mt-2 text-[11px] text-stone-500">
            Hover a shot to retake, upload, or clear it.
          </p>
        </section>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={sequence.isRunning || filledCount === 0}
            onClick={onEdit}
          >
            <Wand2 /> Decorate
          </Button>
          <Button
            className="flex-1 bg-accent text-white hover:bg-accent/90"
            disabled={sequence.isRunning || filledCount === 0}
            onClick={onPrint}
          >
            <Printer /> Print
          </Button>
        </div>
      </aside>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
    </div>
  );
};
