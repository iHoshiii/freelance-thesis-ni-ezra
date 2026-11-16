"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { scansOptions } from "@/lib/workspace-queries";
import { filterQuery } from "@/lib/scans/filters";
import { localDay } from "@/lib/scans/dates";
import type { ScanFilters } from "@/lib/scans/types";
import { WorkspaceShell } from "./workspace-shell";
import { QueryFeedback, QueryPlaceholder } from "./query-feedback";
import { LatestScan } from "./latest-scan";
import { ScanFilterControls } from "./scan-filters";
import { ScanHistory } from "./scan-history";
import { TrendChart } from "./trend-chart";
import { Icon } from "./dashboard-icon";
import { PanelSwitch } from "./panel-switch";

export function ScansDashboard({ filters, filterError }: { filters: ScanFilters; filterError: string }) {
  const query = useQuery(scansOptions(filters));
  if (!query.data) return <WorkspaceShell current="/scans" title="Scans"><QueryPlaceholder query={query} title="Scans" /></WorkspaceShell>;
  const data = query.data;
  const ready = data.status === "ready";
  const path = "/scans";
  const controls = <ScanFilterControls filters={filters} locations={data.locations} path={path} today={localDay()} />;
  const history = <ScanHistory key={JSON.stringify(filters)} scans={filterError ? [] : data.scans} total={filterError ? 0 : data.total} filters={filters} path={path} ready={ready} controls={controls} />;
  return <WorkspaceShell current={path} title="Scans" lastUpload={data.lastUpload}><QueryFeedback query={query} />
    {data.status !== "ready" && <div className="notice" role="status"><Icon name="info" /><strong>Device setup needed</strong><Link href="/setup">Open setup <Icon name="arrow" /></Link></div>}
    {filterError && <div className="notice notice-warning" role="alert"><Icon name="info" /><span>{filterError}</span><Link href={path}>Reset filters</Link></div>}
    <LatestScan scan={data.latest} />
    <div className="scan-period-tabs" aria-label="Quick scan periods">{([['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['all', 'All time']] as const).map(([period, label]) => <Link key={period} scroll={false} href={`${path}?${filterQuery(filters, { period, page: 1, from: "", to: "" })}`} aria-current={filters.period === period ? "true" : undefined}>{label}</Link>)}</div>
    {ready && filters.location && filters.location !== "__unassigned" ? <PanelSwitch labels={["Scans", "Trends"]}>{[history, <TrendChart key="trend" scans={filterError ? [] : data.trend} location={filters.location} />]}</PanelSwitch> : history}
  </WorkspaceShell>;
}
