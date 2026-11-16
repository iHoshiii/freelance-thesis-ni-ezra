"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarState = {
  collapsed: boolean;
  setHovered: (value: boolean) => void;
  setFocused: (value: boolean) => void;
  toggleTouch: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const close = () => { setHovered(false); setFocused(false); setTouchOpen(false); };
  return <SidebarContext.Provider value={{ collapsed: !hovered && !focused && !touchOpen, setHovered, setFocused, toggleTouch: () => setTouchOpen((value) => !value), close }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const sidebar = useContext(SidebarContext);
  if (!sidebar) throw new Error("SidebarProvider is required.");
  return sidebar;
}
