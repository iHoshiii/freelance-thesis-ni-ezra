"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DashboardNav } from "./dashboard-nav";
import { Icon } from "./dashboard-icon";
import { formatDate } from "@/lib/scans/dates";
import { RefreshButton } from "./refresh-button";

export function WorkspaceShell({ children, current = "/", title = "Overview", lastUpload = null }: {
  children: ReactNode; current?: string; title?: string; lastUpload?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return <div className="shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <Link className="brand" href="/"><span className="brand-mark"><Icon name="sprout" /></span><span>SoilSense</span></Link>}
        <button className="sidebar-toggle" type="button" aria-label={collapsed ? "Show sidebar" : "Hide sidebar"} aria-expanded={!collapsed} aria-controls="sidebar-navigation" title={collapsed ? "Show sidebar" : "Hide sidebar"} onClick={() => setCollapsed(!collapsed)}><Icon name={collapsed ? "sprout" : "menu"} /></button>
      </div>
      <div id="sidebar-navigation" hidden={collapsed}><DashboardNav current={current} /></div>
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
