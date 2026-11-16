"use client";

import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";

const subscribe = (update: () => void) => onlineManager.subscribe(update);
const online = () => onlineManager.isOnline();
const serverOnline = () => true;
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, online, serverOnline);
}
