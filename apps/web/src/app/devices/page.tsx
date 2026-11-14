import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { loadDevices } from "@/lib/scans/repository";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { Icon } from "../ui/dashboard-icon";
import { DeviceList } from "../ui/device-list";

async function DeviceContent() {
  await connection();
  const data = await loadDevices();
  return <WorkspaceShell current="/devices" title="Devices" lastUpload={data.lastUpload}><div className="page-actions"><Link className="button button-primary" href="/setup">Device setup <Icon name="arrow" /></Link></div>
    {data.status === "unavailable" && <div className="notice notice-warning" role="alert">Device records are unavailable. Check database setup.</div>}
    {data.devices.length > 0 ? <DeviceList devices={data.devices} /> : <section className="panel empty-state"><span className="empty-icon"><Icon name="device" /></span><h2>No devices yet</h2><Link className="button button-primary" href="/setup">Open setup</Link></section>}
  </WorkspaceShell>;
}

export default function Devices() {
  return <Suspense fallback={<WorkspaceLoading />}><DeviceContent /></Suspense>;
}
