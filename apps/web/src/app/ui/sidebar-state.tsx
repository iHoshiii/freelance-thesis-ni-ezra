"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const SidebarContext = createContext<{ collapsed: boolean; toggle: () => void } | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((current) => !current) }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const sidebar = useContext(SidebarContext);
  if (!sidebar) throw new Error("SidebarProvider is required.");
  return sidebar;
}
