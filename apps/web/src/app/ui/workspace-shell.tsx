"use client";

import type { ReactNode } from "react";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { formatDate } from "@/lib/scans/dates";
import { RefreshButton, QueryActivity } from "./refresh-button";
import { PageSkeleton } from "./page-skeleton";
import { useSidebar } from "./sidebar-state";

export function WorkspaceShell({ children, current = "/", title = "Overview", lastUpload }: {
  children: ReactNode; current?: string; title?: string; lastUpload?: string | null;
}) {
  const { collapsed, close } = useSidebar();
  return <div className={`shell${collapsed ? " sidebar-is-collapsed" : ""}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <WorkspaceSidebar current={current} />
    <main id="main-content" tabIndex={-1} onPointerDown={close}>
      <header className="topbar"><h1>{title}</h1><div className="upload-status">{lastUpload !== undefined && <span>Last upload <strong>{lastUpload ? formatDate(lastUpload, true) : "Not yet"}</strong></span>}<QueryActivity /><RefreshButton current={current} /></div></header>
      <div className="dashboard-content">{children}</div>
    </main>
  </div>;
}

export function WorkspaceLoading({ title = "Overview" }: { title?: string }) {
  const current = ({ Overview: "/", Scans: "/scans", Recommendations: "/recommendations", Statistics: "/statistics", Status: "/status", Devices: "/devices", Setup: "/setup" }[title] ?? "");
  return <WorkspaceShell current={current} title={title}><PageSkeleton title={title} /></WorkspaceShell>;
}
