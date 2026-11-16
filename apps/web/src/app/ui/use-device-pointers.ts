"use client";

import { useEffect, type RefObject } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { deviceAnchors } from "./device-anchors";

export function useDevicePointers(viewer: ModelViewerElement | null, ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const overlay = ref.current;
    if (!viewer || !overlay) return;
    const markers = deviceAnchors.map(({ key, position }) => {
      const marker = document.createElement("span");
      marker.slot = `hotspot-${key}`;
      marker.dataset.position = position;
      marker.dataset.normal = "0 1 0";
      marker.className = "device-anchor";
      marker.setAttribute("aria-hidden", "true");
      viewer.appendChild(marker);
      return marker;
    });
    let frame = 0;
    let active = true;
    const draw = () => {
      frame = 0;
      const bounds = overlay.getBoundingClientRect();
      const canvas = viewer.getBoundingClientRect();
      overlay.querySelector("svg")?.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      for (const { key } of deviceAnchors) {
        const point = viewer.queryHotspot(`hotspot-${key}`)?.canvasPosition;
        const label = overlay.querySelector<HTMLElement>(`[data-callout="${key}"]`);
        const path = overlay.querySelector<SVGPathElement>(`[data-pointer="${key}"]`);
        if (!point || !label || !path) continue;
        const x = canvas.left - bounds.left + point.x;
        const y = canvas.top - bounds.top + point.y;
        const box = label.getBoundingClientRect();
        const left = box.left - bounds.left, right = box.right - bounds.left;
        const top = box.top - bounds.top, bottom = box.bottom - bounds.top;
        const horizontal = x < left || x > right;
        const startX = horizontal ? x < left ? left : right : Math.max(left + 8, Math.min(right - 8, x));
        const startY = horizontal ? (top + bottom) / 2 : y < top ? top : bottom;
        const elbowX = horizontal ? startX + (x < left ? -18 : 18) : startX;
        const elbowY = horizontal ? startY : startY + (y < top ? -12 : 12);
        const visible = point.z > -1 && point.z < 1 && point.x >= 0 && point.x <= canvas.width && point.y >= 0 && point.y <= canvas.height;
        let line = `M${startX},${startY} L${elbowX},${elbowY} L${x},${y}`;
        if (bounds.width <= 700 && key !== "device" && key !== "battery") {
          const onLeft = (left + right) / 2 < bounds.width / 2;
          const lane = bounds.width / 2 + (onLeft ? -2 : 2);
          const turn = Math.min((top + bottom) / 2, canvas.bottom - bounds.top + 6);
          line = `M${onLeft ? right : left},${(top + bottom) / 2} L${lane},${(top + bottom) / 2} L${lane},${turn} L${x},${y}`;
        }
        path.setAttribute("d", visible ? line : "");
      }
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(draw); };
    const resize = new ResizeObserver(schedule);
    resize.observe(overlay);
    overlay.querySelectorAll("[data-callout]").forEach((label) => resize.observe(label));
    viewer.addEventListener("camera-change", schedule);
    viewer.addEventListener("load", schedule);
    void viewer.updateComplete.then(schedule);
    schedule();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewer.removeEventListener("camera-change", schedule);
      viewer.removeEventListener("load", schedule);
      markers.forEach((marker) => marker.remove());
    };
  }, [viewer, ref]);
}
