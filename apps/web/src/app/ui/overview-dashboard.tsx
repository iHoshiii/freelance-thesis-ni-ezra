"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardOptions } from "@/lib/workspace-queries";
import { WorkspaceShell } from "./workspace-shell";
import { formatDate } from "@/lib/scans/dates";
import { scanHref } from "@/lib/scans/types";
import { DeviceMonitor } from "./device-monitor";
import { QueryFeedback, QueryPlaceholder } from "./query-feedback";
import { Icon } from "./dashboard-icon";

export function OverviewDashboard() {
  const query = useQuery(dashboardOptions());
  if (!query.data) return <WorkspaceShell title="Overview"><QueryPlaceholder query={query} title="Overview" /></WorkspaceShell>;
  const { workspace, summary, reports, telemetryAvailable, checkedAt } = query.data;
  const available = workspace.status === "ready";
  return <WorkspaceShell title="Overview" lastUpload={workspace.lastUpload}><QueryFeedback query={query} />
    <div className="overview-heading"><span className="muted">Your soil workspace</span><Link className="text-link" href="/scans">View scans <Icon name="arrow" /></Link></div>
    {!available && <div className="notice notice-warning" role="status"><span>{workspace.status === "setup" ? "Configure a device to start receiving scans." : "Scan records are unavailable. Check Status."}</span><Link href="/status">Status <Icon name="arrow" /></Link></div>}
    <section className="summary-grid" aria-label="Scan totals">{[["Last 7 days", summary.week], ["Last 30 days", summary.month], ["All synced scans", summary.total]].map(([label, count]) => <section className="panel summary-card" key={label}><span>{label}</span><strong>{available ? Number(count).toLocaleString() : "--"}</strong><small>{label === "All synced scans" ? "Saved in the database" : "By scan time · UTC+8"}</small></section>)}</section>
    <div className="overview-workspace"><DeviceMonitor devices={workspace.devices} reports={reports} telemetryAvailable={telemetryAvailable} checkedAt={checkedAt} /><section className="panel latest-upload"><div><span className="muted">Last scan</span><strong>{workspace.latest?.sampleId ?? "No scans yet"}</strong><small>{workspace.latest ? `${workspace.latest.location ?? "Unassigned"} · ${formatDate(workspace.latest.acquiredAt, true)}` : "Waiting for an upload"}</small></div><Link className="text-link" href={workspace.latest ? scanHref(workspace.latest) : "/scans"}>{workspace.latest ? "View scan" : "Open scans"} <Icon name="arrow" /></Link></section></div>
    <div className="workspace-footnote"><span>{summary.unknownTime ? `${summary.unknownTime} scan${summary.unknownTime === 1 ? " has an unknown scan time" : "s have unknown scan times"}; included in all-time totals only.` : "Offline scans are counted separately until the device uploads them."}</span><Link href="/status">Device & connection status <Icon name="arrow" /></Link></div>
  </WorkspaceShell>;
}
