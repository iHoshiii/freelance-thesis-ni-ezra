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
    {!available && <div className="notice notice-warning" role="status"><span>{workspace.status === "setup" ? "Configure a device to start receiving scans." : "Scan records are unavailable. Check Status."}</span><Link href="/status">Status <Icon name="arrow" /></Link></div>}
    <section className="summary-grid" aria-label="Scan totals">{[["Last 7 days", summary.week], ["Last 30 days", summary.month], ["All time", summary.total]].map(([label, count]) => <section className="summary-card" key={label}><span>{label}</span><strong>{available ? Number(count).toLocaleString() : "--"}</strong></section>)}</section>
    <div className="overview-workspace"><DeviceMonitor devices={workspace.devices} reports={reports} telemetryAvailable={telemetryAvailable} checkedAt={checkedAt} /><section className="latest-upload"><div><span className="muted">Last scan</span><strong>{workspace.latest?.sampleId ?? "--"}</strong>{workspace.latest && <small>{workspace.latest.location ?? "Unassigned"} · {formatDate(workspace.latest.acquiredAt, true)}</small>}</div><Link className="text-link" href={workspace.latest ? scanHref(workspace.latest) : "/scans"}>{workspace.latest ? "View scan" : "Scans"} <Icon name="arrow" /></Link></section></div>
  </WorkspaceShell>;
}
