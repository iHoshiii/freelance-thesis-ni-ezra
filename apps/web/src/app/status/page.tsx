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
    <div className="page-actions"><Link className="text-link" href="/devices">Devices <Icon name="arrow" /></Link><Link className="text-link" href="/setup">Setup <Icon name="arrow" /></Link></div>
    <ServiceHealth />
    <DeviceMonitor detailed devices={workspace.devices} reports={reports} telemetryAvailable={telemetryAvailable} checkedAt={checkedAt} />
  </WorkspaceShell>;
}
