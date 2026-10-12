"use client";

import "./photobox.css";
import { useAtom, useAtomValue } from "jotai";
import { Camera, Images, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  photoboxDecorationsAtom,
  photoboxGalleryAtom,
  photoboxPhotosAtom,
  photoboxSettingsAtom,
} from "@/application/atoms/photoboxAtom";
import { windowRegistryAtom } from "@/application/atoms/windowAtoms";
import { cn, playSound } from "@/infrastructure/lib/utils";
import { savePhotoboxPrint } from "@/infrastructure/utils/photoboxStorage";
import { CaptureView } from "./components/CaptureView";
import { EditView } from "./components/EditView";
import { GalleryView } from "./components/GalleryView";
import { PrintOverlay } from "./components/PrintOverlay";
import { getFilter } from "./constants/filters";
import { getFrame } from "./constants/frames";
import { getLayout } from "./constants/layouts";
import {
  buildFilename,
  canvasToJpegBlob,
  downloadBlob,
  forgetImage,
  renderComposite,
} from "./utils/renderComposite";

type View = "capture" | "edit" | "gallery";

// Layouts are defined at ~600-1500px; export at 2x for a sharp JPG
const EXPORT_SCALE = 2;

interface PrintResult {
  blob: Blob;
  url: string;
  aspect: number;
  createdAt: Date;
  saveError: string | null;
}

const createPrintId = () =>
  `print_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const Photobox = () => {
  const [view, setView] = useState<View>("capture");
  const [isPrinting, setIsPrinting] = useState(false);
  const [print, setPrint] = useState<PrintResult | null>(null);
  const settings = useAtomValue(photoboxSettingsAtom);
  const [photos, setPhotos] = useAtom(photoboxPhotosAtom);
  const [decorations, setDecorations] = useAtom(photoboxDecorationsAtom);
  const [gallery, setGallery] = useAtom(photoboxGalleryAtom);
  const registry = useAtomValue(windowRegistryAtom);

  // The window stays mounted (display: none) while minimized, so stop the camera then
  const isMinimized = Object.values(registry).some(
    (win) => win?.appId === "photobox" && win.isMinimized
  );
  const cameraActive = view === "capture" && !isMinimized && !print;

  const printUrlRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (printUrlRef.current) URL.revokeObjectURL(printUrlRef.current);
    },
    []
  );

  const closePrint = () => {
    if (print) URL.revokeObjectURL(print.url);
    printUrlRef.current = null;
    setPrint(null);
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      const layout = getLayout(settings.layoutId);
      const canvas = await renderComposite({
        layout,
        photos,
        filter: getFilter(settings.filterId),
        frame: getFrame(settings.frameId),
        caption: settings.caption,
        decorations,
        scale: EXPORT_SCALE,
      });
      const blob = await canvasToJpegBlob(canvas);
      const createdAt = new Date();
      const id = createPrintId();

      let saveError: string | null = null;
      try {
        await savePhotoboxPrint(id, blob);
        setGallery((prev) => [
          {
            id,
            createdAt: createdAt.getTime(),
            layoutId: layout.id,
            width: canvas.width,
            height: canvas.height,
          },
          ...prev,
        ]);
      } catch (error) {
        console.error("Failed to save photobox print", error);
        saveError =
          "Couldn't save to the gallery (browser storage full or blocked). You can still download it.";
      }

      if (print) URL.revokeObjectURL(print.url);
      const url = URL.createObjectURL(blob);
      printUrlRef.current = url;
      setPrint({
        blob,
        url,
        aspect: layout.width / layout.height,
        createdAt,
        saveError,
      });
    } catch (error) {
      console.error("Failed to print photobox strip", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const startNewSession = () => {
    photos.forEach((photo) => photo && forgetImage(photo));
    setPhotos([]);
    setDecorations([]);
    closePrint();
    setView("capture");
  };

  const hasPhotos = photos.some(Boolean);
  const tabs: {
    id: View;
    label: string;
    icon: typeof Camera;
    disabled?: boolean;
  }[] = [
    { id: "capture", label: "Camera", icon: Camera },
    { id: "edit", label: "Decorate", icon: Wand2, disabled: !hasPhotos },
    { id: "gallery", label: `Gallery (${gallery.length})`, icon: Images },
  ];

  return (
    <div className="@container relative flex h-full flex-col gap-3 bg-stone-50 p-3">
      <nav className="flex shrink-0 gap-1 rounded-lg bg-black/5 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => {
              playSound("/sounds/click.mp3");
              setView(tab.id);
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition disabled:opacity-40",
              view === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-stone-500 hover:text-primary"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1">
        {view === "capture" && (
          <CaptureView
            cameraActive={cameraActive}
            onEdit={() => setView("edit")}
            onPrint={() => void handlePrint()}
          />
        )}
        {view === "edit" && (
          <EditView
            onBack={() => setView("capture")}
            onPrint={() => void handlePrint()}
          />
        )}
        {view === "gallery" && <GalleryView />}
      </div>

      {isPrinting && !print && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/40 text-sm font-semibold text-white">
          Preparing your print…
        </div>
      )}

      {print && (
        <PrintOverlay
          key={print.url}
          imageUrl={print.url}
          aspect={print.aspect}
          saveError={print.saveError}
          onDownload={() =>
            downloadBlob(print.blob, buildFilename(print.createdAt))
          }
          onEdit={() => {
            closePrint();
            setView("edit");
          }}
          onGallery={() => {
            closePrint();
            setView("gallery");
          }}
          onNewSession={startNewSession}
        />
      )}
    </div>
  );
};

export default Photobox;
