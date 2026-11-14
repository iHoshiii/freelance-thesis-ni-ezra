import { Suspense } from "react";
import { connection } from "next/server";
import { workspaceConfig } from "@/lib/workspace-config";
import { loadDevices } from "@/lib/scans/repository";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { SetupGuide } from "../ui/setup-guide";

async function SetupContent() {
  await connection();
  const config = workspaceConfig();
  const data = await loadDevices();
  const checks = [
    { label: "Database configured", done: config.database },
    { label: "Device IDs configured", done: config.valid },
    { label: "Device registered", done: data.status === "ready" && data.devices.length > 0 },
    { label: "First scan received", done: Boolean(data.lastUpload) },
  ];
  return <WorkspaceShell current="/setup" title="Setup" lastUpload={data.lastUpload}><SetupGuide checks={checks} /></WorkspaceShell>;
}

export default function Setup() {
  return <Suspense fallback={<WorkspaceLoading />}><SetupContent /></Suspense>;
}
