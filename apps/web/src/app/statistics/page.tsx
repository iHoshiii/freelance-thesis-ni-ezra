import { Suspense } from "react";
import { connection } from "next/server";
import type { SearchParams } from "@/lib/scans/types";
import { loadStatistics, statisticsPeriod, loadDashboard } from "@/lib/dashboard-data";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { StatisticsPanel } from "../ui/statistics-panel";

async function StatisticsContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const period = statisticsPeriod(params.period);
  const location = typeof params.location === "string" ? params.location.slice(0, 120) : "";
  const [data, { workspace }] = await Promise.all([loadStatistics(period, location), loadDashboard()]);
  return <WorkspaceShell current="/statistics" title="Statistics" lastUpload={workspace.lastUpload}>
    <form className="statistics-filters" action="/statistics"><label>Period<select name="period" defaultValue={period}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="year">Last year (365 days)</option><option value="all">All time</option></select></label><label>Location<select name="location" defaultValue={location}><option value="">All locations</option>{workspace.locations.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary">Apply</button></form>
    {data ? <StatisticsPanel data={data} /> : <section className="panel empty-state"><h2>Statistics unavailable</h2><p>Check the database connection and device setup in Status.</p><a className="button button-secondary" href="/status">Open status</a></section>}
    <div className="workspace-footnote"><span>Statistics use all matching synced scans, including scans beyond the first page. Date filters exclude unknown scan times.</span></div>
  </WorkspaceShell>;
}
export default function Statistics({ searchParams }: { searchParams: Promise<SearchParams> }) { return <Suspense fallback={<WorkspaceLoading />}><StatisticsContent searchParams={searchParams} /></Suspense>; }
