import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardNav } from "./dashboard-nav";
import { Icon } from "./dashboard-icon";
import { formatDate } from "@/lib/scans/dates";
import { RefreshButton } from "./refresh-button";

export function WorkspaceShell({ children, current = "/", title = "Overview", lastUpload = null }: {
  children: ReactNode; current?: string; title?: string; lastUpload?: string | null;
}) {
  return <div className="shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark"><Icon name="sprout" /></span><span>SoilSense<span className="brand-caption">FIELD WORKSPACE</span></span></Link>
      <div className="nav-label">WORKSPACE</div>
      <DashboardNav current={current} />
      <div className="sidebar-bottom"><div className="workspace-label"><span className="status-dot" /><div>Research workspace<small>Shared access</small></div></div><span className="sidebar-caption">Soil monitoring, made clear.</span></div>
    </aside>
    <main id="main-content" tabIndex={-1}>
      <header className="topbar"><div className="breadcrumb"><Icon name="grid" /><span>Workspace</span><span>/</span><strong>{title}</strong></div><div className="upload-status"><span className="status-dot" /><span>Last upload <strong>{lastUpload ? formatDate(lastUpload, true) : "Not yet"}</strong></span><RefreshButton /></div></header>
      <div className="dashboard-content">{children}<footer><span>SoilSense <span className="footer-divider">/</span> Research prototype</span><span>Times shown in Philippine time (UTC+8)</span></footer></div>
    </main>
  </div>;
}

export function WorkspaceLoading() {
  return <WorkspaceShell><div className="page-heading"><div><p className="eyebrow">SOIL MONITORING</p><h1>Overview</h1></div></div><div className="loading-panel" role="status">Loading scans...</div></WorkspaceShell>;
}
