"use client";

import { useEffect, useRef, useState } from "react";

// Page the content to fit the available space instead of hiding overflowing rows.
export function useFitPage(rowHeight: number, headerHeight = 0, cardWidth = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(1);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const columns = cardWidth ? Math.max(1, Math.floor((width + 12) / (cardWidth + 12))) : 1;
      setCapacity(Math.max(1, Math.floor((height - headerHeight) / rowHeight)) * columns);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rowHeight, headerHeight, cardWidth]);
  return { ref, capacity };
}
