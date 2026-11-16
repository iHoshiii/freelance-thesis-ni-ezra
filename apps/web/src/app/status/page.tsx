"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardOptions } from "@/lib/workspace-queries";
import { WorkspaceShell } from "../ui/workspace-shell";
import { DeviceMonitor, ServiceHealth } from "../ui/device-monitor";
import { QueryFeedback, QueryPlaceholder } from "../ui/query-feedback";
import { Icon } from "../ui/dashboard-icon";

export default function Status() {
  const query = useQuery(dashboardOptions());
  if (!query.data) return <WorkspaceShell current="/status" title="Status">{(!query.isPending || query.isPaused) && <ServiceHealth />}<QueryPlaceholder query={query} title="Status" /></WorkspaceShell>;
  const { workspace, reports, telemetryAvailable, checkedAt } = query.data;
  return <WorkspaceShell current="/status" title="Status" lastUpload={workspace.lastUpload}><QueryFeedback query={query} />
    <div className="overview-heading"><span className="muted">Connections & device health</span><Link className="text-link" href="/setup">Device setup <Icon name="arrow" /></Link></div>
    <ServiceHealth />
    <DeviceMonitor detailed devices={workspace.devices} reports={reports} telemetryAvailable={telemetryAvailable} checkedAt={checkedAt} />
    <div className="workspace-footnote"><span>Device reports expire after 90 seconds. Missing readings alone do not prove a sensor fault.</span><Link href="/devices">Registered devices <Icon name="arrow" /></Link></div>
  </WorkspaceShell>;
}
