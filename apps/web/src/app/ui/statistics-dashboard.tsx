"use client";

import Link from "next/link";
import Form from "next/form";
import { useQuery } from "@tanstack/react-query";
import { statisticsOptions } from "@/lib/workspace-queries";
import { WorkspaceShell } from "./workspace-shell";
import { StatisticsPanel } from "./statistics-panel";
import { QueryFeedback, QueryPlaceholder } from "./query-feedback";

export function StatisticsDashboard({ period, location }: { period: string; location: string }) {
  const query = useQuery(statisticsOptions(period, location));
  if (!query.data) return <WorkspaceShell current="/statistics" title="Statistics"><QueryPlaceholder query={query} title="Statistics" /></WorkspaceShell>;
  const { statistics: data, locations, lastUpload } = query.data;
  return <WorkspaceShell current="/statistics" title="Statistics" lastUpload={lastUpload}><QueryFeedback query={query} />
    <Form className="statistics-filters" action="/statistics" scroll={false} key={`${period}/${location}`}><label>Period<select name="period" defaultValue={period}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="year">Last year</option><option value="all">All time</option></select></label><label>Location<select name="location" defaultValue={location}><option value="">All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary">Apply</button></Form>
    {data ? <StatisticsPanel data={data} /> : <section className="panel empty-state"><h2>Statistics unavailable</h2><p>Check the database connection and device setup in Status.</p><Link className="button button-secondary" href="/status">Open status</Link></section>}
  </WorkspaceShell>;
}
