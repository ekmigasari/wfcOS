"use client";

import { useEffect, useRef, useState } from "react";

// Tracks an element's content box size (windows can be resized at any time)
export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};

// Largest box with the given aspect ratio that fits inside the container
export const fitAspect = (
  container: { width: number; height: number },
  ratio: number
) => {
  if (!container.width || !container.height) return { width: 0, height: 0 };
  const width = Math.min(container.width, container.height * ratio);
  return { width, height: width / ratio };
};
