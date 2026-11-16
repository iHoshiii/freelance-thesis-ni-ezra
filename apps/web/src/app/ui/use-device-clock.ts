"use client";

import { useSyncExternalStore } from "react";

const currentSecond = () => Math.ceil(Date.now() / 1000) * 1000;
function subscribe(update: () => void) {
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
}
export function useDeviceClock(serverTime: number) {
  return useSyncExternalStore(subscribe, currentSecond, () => serverTime);
}
