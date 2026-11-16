"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardNav } from "./dashboard-nav";
import { Icon } from "./dashboard-icon";
import { formatDate } from "@/lib/scans/dates";
import { RefreshButton } from "./refresh-button";
import { useSidebar } from "./sidebar-state";

export function WorkspaceShell({ children, current = "/", title = "Overview", lastUpload = null }: {
  children: ReactNode; current?: string; title?: string; lastUpload?: string | null;
}) {
  const { collapsed, toggle } = useSidebar();
  return <div className={`shell${collapsed ? " sidebar-is-collapsed" : ""}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <Link className="brand" href="/" aria-label="SoilSense overview"><span className="brand-mark"><Icon name="sprout" /></span><span className="brand-name" aria-hidden={collapsed}>SoilSense</span></Link>
        <button className="sidebar-toggle" type="button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="sidebar-navigation" title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={toggle}><Icon name={collapsed ? "chevronRight" : "chevronLeft"} /></button>
      </div>
      <div id="sidebar-navigation"><DashboardNav current={current} /></div>
    </aside>
    <main id="main-content" tabIndex={-1}>
      <header className="topbar"><h1>{title}</h1><div className="upload-status"><span>Last upload <strong>{lastUpload ? formatDate(lastUpload, true) : "Not yet"}</strong></span><RefreshButton /></div></header>
      <div className="dashboard-content">{children}</div>
    </main>
  </div>;
}

export function WorkspaceLoading() {
  return <WorkspaceShell><div className="loading-panel" role="status">Loading scans…</div></WorkspaceShell>;
}
