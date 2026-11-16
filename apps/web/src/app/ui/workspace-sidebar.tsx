"use client";

import { useRef } from "react";
import { DashboardNav } from "./dashboard-nav";
import { Icon } from "./dashboard-icon";
import { useSidebar } from "./sidebar-state";

export function WorkspaceSidebar({ current }: { current: string }) {
  const { collapsed, setHovered, setFocused, toggleTouch, close } = useSidebar();
  const pointer = useRef("mouse");
  return <aside aria-label="Workspace sidebar" className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}
    onPointerEnter={(event) => { if (event.pointerType === "mouse" && matchMedia("(min-width: 701px)").matches) setHovered(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered(false); }}
    onPointerDownCapture={(event) => { pointer.current = event.pointerType; setFocused(false); }}
    onFocusCapture={(event) => { if (event.target.matches(":focus-visible")) setFocused(true); }}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.querySelector<HTMLElement>(":focus")?.blur(); close(); } }}>
    <div className="sidebar-header">
      <button className="brand" type="button" aria-label="Toggle sidebar" aria-expanded={!collapsed} aria-controls="sidebar-navigation"
        onClick={(event) => { if (pointer.current !== "mouse" || event.detail === 0 || matchMedia("(max-width: 700px)").matches) { setFocused(false); toggleTouch(); } }}>
        <span className="brand-mark"><Icon name="sprout" /></span><span className="brand-name" aria-hidden={collapsed}>SoilSense</span>
      </button>
    </div>
    <div id="sidebar-navigation" onClick={(event) => { if (pointer.current !== "mouse" && (event.target as Element).closest("a")) close(); }}><DashboardNav current={current} /></div>
  </aside>;
}
