import Link from "next/link";
import { connection } from "next/server";
import { loadWorkspace } from "@/lib/scans/repository";
import { defaultFilters, parseFilters } from "@/lib/scans/filters";
import { localDay } from "@/lib/scans/dates";
import type { SearchParams } from "@/lib/scans/types";
import { WorkspaceShell } from "./workspace-shell";
import { LatestScan } from "./latest-scan";
import { ScanFilterControls } from "./scan-filters";
import { ScanHistory } from "./scan-history";
import { TrendChart } from "./trend-chart";
import { Icon } from "./dashboard-icon";
import { PanelSwitch } from "./panel-switch";

export async function WorkspaceDashboard({ searchParams, scansOnly = false }: {
  searchParams: Promise<SearchParams>; scansOnly?: boolean;
}) {
  await connection();
  let filters = defaultFilters;
  let filterError = "";
  try { filters = parseFilters(await searchParams); }
  catch (error) { filterError = error instanceof Error ? error.message : "Check the scan filters."; }
  const data = await loadWorkspace(filters);
  const path = scansOnly ? "/scans" : "/";
  const ready = data.status === "ready";
  const controls = <ScanFilterControls filters={filters} locations={data.locations} path={path} today={localDay()} />;
  const history = <ScanHistory key={JSON.stringify(filters)} scans={filterError ? [] : data.scans} total={filterError ? 0 : data.total} filters={filters} path={path} ready={ready} controls={controls} />;
  return <WorkspaceShell current={path} title={scansOnly ? "Scans" : "Overview"} lastUpload={data.lastUpload}>
    {data.status !== "ready" && <div className={`notice ${data.status === "unavailable" ? "notice-warning" : ""}`} role="status"><Icon name="info" /><strong>{data.status === "unavailable" ? "Database unavailable" : "Device setup needed"}</strong><Link href="/setup">Open setup <Icon name="arrow" /></Link></div>}
    {filterError && <div className="notice notice-warning" role="alert"><Icon name="info" /><span>{filterError}</span><Link href={path}>Reset filters</Link></div>}
    {!scansOnly && <LatestScan scan={data.latest} />}
    {ready && filters.location && filters.location !== "__unassigned" ? <PanelSwitch labels={["Scans", "Trends"]}>{[history, <TrendChart key="trend" scans={filterError ? [] : data.trend} location={filters.location} />]}</PanelSwitch> : history}
  </WorkspaceShell>;
}
