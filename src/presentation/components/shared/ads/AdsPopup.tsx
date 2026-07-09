"use client";

import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { adData, adsPopupSettings } from "@/infrastructure/config/adsData";
import { openExternalUrl } from "@/infrastructure/utils/externalNavigation";
import { Button } from "@/presentation/components/ui/button";

export const AdsPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const cycleCompleteRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reappearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (reappearTimeoutRef.current) {
      clearTimeout(reappearTimeoutRef.current);
      reappearTimeoutRef.current = null;
    }
  }, []);

  const scheduleReappear = useCallback(() => {
    if (adsPopupSettings.reappearDurationMs <= 0) {
      cycleCompleteRef.current = false;
      setCurrentAdIndex(0);
      setIsVisible(true);
      return;
    }

    reappearTimeoutRef.current = setTimeout(() => {
      setCurrentAdIndex(0);
      cycleCompleteRef.current = false;
      setIsChanging(false);
      setIsVisible(true);
    }, adsPopupSettings.reappearDurationMs);
  }, []);

  const handleClose = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      clearTimers();
      setIsChanging(false);
      setIsVisible(false);
      cycleCompleteRef.current = false;
      scheduleReappear();
    },
    [clearTimers, scheduleReappear]
  );

  const handleAdClick = useCallback(() => {
    if (adData[currentAdIndex]?.url) {
      openExternalUrl(adData[currentAdIndex].url);
    }
  }, [currentAdIndex]);

  useEffect(() => {
    if (
      !adsPopupSettings.enabled ||
      !isVisible ||
      cycleCompleteRef.current ||
      adData.length <= 1
    ) {
      return;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsChanging(true);

      reappearTimeoutRef.current = setTimeout(() => {
        const nextIndex = (currentAdIndex + 1) % adData.length;
        setCurrentAdIndex(nextIndex);

        if (nextIndex === 0 && currentAdIndex === adData.length - 1) {
          cycleCompleteRef.current = true;
          setIsVisible(false);
          scheduleReappear();
        }

        setIsChanging(false);
      }, adsPopupSettings.transitionDurationMs);
    }, adsPopupSettings.displayDurationMs);

    return clearTimers;
  }, [clearTimers, currentAdIndex, isVisible, scheduleReappear]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!adsPopupSettings.enabled || adData.length === 0 || !isVisible) {
    return null;
  }

  const currentAd = adData[currentAdIndex];
  const isEmoji = currentAd.thumbnail?.type === "emoji";

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 sm:max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div
        className={`group bg-primary text-white border-2 border-secondary rounded-lg shadow 
        hover:shadow-xl transition-all cursor-pointer w-full sm:w-[280px] ${
          isChanging ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transition: `opacity ${adsPopupSettings.transitionDurationMs}ms ease-in-out`,
        }}
        onClick={handleAdClick}
      >
        <div className="p-3 flex items-start gap-3">
          {isEmoji ? (
            <div className="shrink-0 w-8 h-8 flex items-center justify-center text-2xl">
              {currentAd.thumbnail.content}
            </div>
          ) : (
            <div className="relative shrink-0 w-8 h-8 overflow-hidden">
              <Image
                src={currentAd.thumbnail?.content || "/placeholder.svg"}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex-1 min-w-0 gap-2">
            <h3 className="text-sm font-medium text-white mb-0.5">
              {currentAd.title}
            </h3>

            <p className="text-xs text-gray-400 line-clamp-3">
              {currentAd.description}
            </p>
          </div>

          <div className="flex items-start gap-1">
            {adsPopupSettings.showCloseButton ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 -mt-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleClose}
                aria-label="Close advertisement"
              >
                <X className="h-3 w-3" />
              </Button>
            ) : null}

            <ArrowUpRight className="h-5 w-5 -mt-1 -mr-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
