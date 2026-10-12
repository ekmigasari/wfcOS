"use client";

import { RotateCw, X } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useRef } from "react";
import { EMOJI_FONT_STACK, getFontCss } from "../constants/stickers";
import type { Decoration } from "../types/photobox";
import { TEXT_LINE_HEIGHT } from "../utils/renderComposite";

interface DecorationLayerProps {
  items: Decoration[];
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<Decoration>) => void;
  onRemove: (id: string) => void;
}

type DragState =
  | {
      mode: "move";
      id: string;
      startX: number;
      startY: number;
      itemX: number;
      itemY: number;
    }
  | {
      mode: "transform";
      id: string;
      centerX: number;
      centerY: number;
      startDistance: number;
      startAngle: number;
      itemSize: number;
      itemRotation: number;
    };

const MIN_SIZE = 0.03;
const MAX_SIZE = 1.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const DecorationLayer = ({
  items,
  width,
  height,
  selectedId,
  onSelect,
  onChange,
  onRemove,
}: DecorationLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const startMove = (event: ReactPointerEvent, item: Decoration) => {
    event.stopPropagation();
    onSelect(item.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode: "move",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      itemX: item.x,
      itemY: item.y,
    };
  };

  // Corner handle: distance from center scales, angle around center rotates
  const startTransform = (event: ReactPointerEvent, item: Decoration) => {
    event.stopPropagation();
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const centerX = rect.left + item.x * rect.width;
    const centerY = rect.top + item.y * rect.height;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    dragRef.current = {
      mode: "transform",
      id: item.id,
      centerX,
      centerY,
      startDistance: Math.max(1, Math.hypot(dx, dy)),
      startAngle: Math.atan2(dy, dx),
      itemSize: item.size,
      itemRotation: item.rotation,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !width || !height) return;

    if (drag.mode === "move") {
      onChange(drag.id, {
        x: clamp(drag.itemX + (event.clientX - drag.startX) / width, 0, 1),
        y: clamp(drag.itemY + (event.clientY - drag.startY) / height, 0, 1),
      });
    } else {
      const dx = event.clientX - drag.centerX;
      const dy = event.clientY - drag.centerY;
      const angle = Math.atan2(dy, dx);
      const rotation =
        drag.itemRotation + ((angle - drag.startAngle) * 180) / Math.PI;
      onChange(drag.id, {
        size: clamp(
          (drag.itemSize * Math.hypot(dx, dy)) / drag.startDistance,
          MIN_SIZE,
          MAX_SIZE
        ),
        rotation: Math.round(rotation * 10) / 10,
      });
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 overflow-hidden"
      onPointerDown={() => onSelect(null)}
    >
      {items.map((item) => {
        const fontSize = item.size * width;
        const isSelected = item.id === selectedId;
        return (
          <div
            key={item.id}
            className="absolute cursor-move touch-none select-none"
            style={{
              left: item.x * width,
              top: item.y * height,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            }}
            onPointerDown={(event) => startMove(event, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {item.type === "emoji" && (
              <span
                className="block"
                style={{
                  fontSize,
                  lineHeight: 1,
                  fontFamily: EMOJI_FONT_STACK,
                }}
              >
                {item.content}
              </span>
            )}
            {item.type === "icon" && (
              <img
                src={item.content}
                alt=""
                draggable={false}
                className="pb-pixelated block"
                style={{ width: fontSize }}
              />
            )}
            {item.type === "text" && (
              <div
                className="font-bold whitespace-pre text-center"
                style={{
                  fontSize,
                  lineHeight: TEXT_LINE_HEIGHT,
                  fontFamily: getFontCss(item.font),
                  color: item.color,
                }}
              >
                {item.content || " "}
              </div>
            )}

            {isSelected && (
              <>
                <div className="pointer-events-none absolute -inset-1 rounded border-2 border-dashed border-sky-500" />
                <button
                  type="button"
                  title="Remove"
                  className="absolute -top-3 -left-3 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onRemove(item.id)}
                >
                  <X className="size-3.5" />
                </button>
                <div
                  title="Drag to resize and rotate"
                  className="absolute -right-3 -bottom-3 flex size-6 cursor-nwse-resize items-center justify-center rounded-full bg-sky-500 text-white shadow"
                  onPointerDown={(event) => startTransform(event, item)}
                >
                  <RotateCw className="size-3.5" />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
