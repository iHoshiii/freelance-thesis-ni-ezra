import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { loadDashboard } from "@/lib/dashboard-data";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { DeviceMonitor, ServiceHealth } from "../ui/device-monitor";
import { LiveRefresh } from "../ui/live-refresh";
import { Icon } from "../ui/dashboard-icon";

async function StatusContent() {
  await connection();
  const { workspace, reports, telemetryAvailable, checkedAt } = await loadDashboard();
  return <WorkspaceShell current="/status" title="Status" lastUpload={workspace.lastUpload}><LiveRefresh />
    <div className="overview-heading"><span className="muted">Connections & device health</span><Link className="text-link" href="/setup">Device setup <Icon name="arrow" /></Link></div>
    <ServiceHealth initialDatabase={workspace.status === "ready" ? "connected" : process.env.DATABASE_URL ? "unknown" : "not_configured"} initialSchema={workspace.status === "ready"} />
    <DeviceMonitor detailed devices={workspace.devices} reports={reports} telemetryAvailable={telemetryAvailable} checkedAt={checkedAt} />
    <div className="workspace-footnote"><span>Device reports expire after 90 seconds. Missing readings alone do not prove a sensor fault.</span><Link href="/devices">Registered devices <Icon name="arrow" /></Link></div>
  </WorkspaceShell>;
}
export default function Status() { return <Suspense fallback={<WorkspaceLoading />}><StatusContent /></Suspense>; }
