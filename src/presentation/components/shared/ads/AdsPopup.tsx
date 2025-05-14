"use client";

import { ArrowUpRight } from "lucide-react";
// import { Button } from "@/presentation/components/ui/button";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef,useState } from "react";

// Easily configurable time settings (all in milliseconds)
const adSettings = {
  adRotationInterval: 8000, // Time between ad changes (8 seconds)
  adReappearInterval: 600000, // Time before ads show again after closing/completing cycle (10 minutes)
};

// Sample ad data with both image and emoji options
const adData = [
  {
    id: 1,
    title: "NextJS Global Hackathon",
    description: "WFC OS is the winner of the Highest Quality App category",
    url: "https://workfromcoffee.com/blog/wfcos-hackathon-award-announcement",
    thumbnail: {
      type: "emoji",
      content: "🏆",
    },
  },
  {
    id: 2,
    title: "Send us Feedback",
    description: "Got any feedback? We'd love to hear from you!",
    url: "https://workfromcoffee.featurebase.app",
    thumbnail: {
      type: "emoji",
      content: "💬",
    },
  },
  {
    id: 3,
    title: "Screen Studio",
    description: "Beautiful screen recordings in minutes",
    url: "https://screenstudio.lemonsqueezy.com?aff=dK6dm",
    thumbnail: {
      type: "emoji",
      content: "🎥",
    },
  },
  {
    id: 4,
    title: "Danny Postma SEO Blueprint",
    description: "The Exact Blueprint That Ranked My Sites #1 on Google",
    url: "https://www.dannypostma.com/seo-course?via=digitalcreatorhq",
    thumbnail: {
      type: "emoji",
      content: "🔍",
    },
  },
  {
    id: 5,
    title: "Codefast",
    description: "Learn to code in weeks, not months",
    url: "https://codefa.st/?via=digitalcreatorhq",
    thumbnail: {
      type: "emoji",
      content: "💻",
    },
  },
];

export const AdsPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const cycleCompleteRef = useRef(false);

  //   // Handle closing the ad
  //   const handleClose = useCallback((e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     setIsVisible(false);

  //     // Reappear after configured interval
  //     setTimeout(() => {
  //       setCurrentAdIndex(0);
  //       cycleCompleteRef.current = false;
  //       setIsVisible(true);
  //     }, adSettings.adReappearInterval);
  //   }, []);

  // Handle clicking on the ad
  const handleAdClick = useCallback(() => {
    if (adData[currentAdIndex]?.url) {
      window.open(adData[currentAdIndex].url, "_blank");
    }
  }, [currentAdIndex]);

  // Rotate ads at the configured interval
  useEffect(() => {
    if (!isVisible || cycleCompleteRef.current) return;

    const interval = setInterval(() => {
      setIsChanging(true);

      // Wait for fade-out animation to complete
      setTimeout(() => {
        const nextIndex = (currentAdIndex + 1) % adData.length;
        setCurrentAdIndex(nextIndex);

        // If we've shown all ads, mark the cycle as complete
        if (nextIndex === 0 && currentAdIndex === adData.length - 1) {
          cycleCompleteRef.current = true;
          setIsVisible(false);

          // Reappear after configured interval
          setTimeout(() => {
            cycleCompleteRef.current = false;
            setIsVisible(true);
          }, adSettings.adReappearInterval);
        }

        setIsChanging(false);
      }, 3000); // Duration of fade-out animation
    }, adSettings.adRotationInterval);

    return () => clearInterval(interval);
  }, [isVisible, currentAdIndex]);

  if (!isVisible) return null;

  const currentAd = adData[currentAdIndex];
  const isEmoji = currentAd.thumbnail.type === "emoji";

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 sm:max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div
        className={`group bg-primary text-white border-2 border-secondary rounded-lg shadow 
        hover:shadow-xl transition-all cursor-pointer w-full sm:w-[280px] ${
          isChanging ? "opacity-0" : "opacity-100"
        }`}
        style={{ transition: "opacity 1000ms ease-in-out" }}
        onClick={handleAdClick}
      >
        <div className="p-3 flex items-start gap-3">
          {/* Thumbnail - either emoji or image */}
          {isEmoji ? (
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-2xl">
              {currentAd.thumbnail.content}
            </div>
          ) : (
            <div className="relative flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={currentAd.thumbnail.content || "/placeholder.svg"}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
          )}
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium text-white mb-0.5">
              {currentAd.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-400 line-clamp-2">
              {currentAd.description}
            </p>
          </div>
          {/* Close button */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 -mt-1 -mr-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClose}
            aria-label="Close advertisement"
          >
            <X className="h-3 w-3" />
          </Button> */}
          <ArrowUpRight className="h-5 w-5 -mt-1 -mr-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
