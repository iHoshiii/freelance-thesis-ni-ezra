import { Suspense } from "react";
import type { SearchParams } from "@/lib/scans/types";
import { statisticsPeriod } from "@/lib/dashboard-data";
import { WorkspaceLoading } from "../ui/workspace-shell";
import { StatisticsDashboard } from "../ui/statistics-dashboard";

async function StatisticsContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const period = statisticsPeriod(params.period);
  const location = typeof params.location === "string" ? params.location.slice(0, 120) : "";
  return <StatisticsDashboard period={period} location={location} />;
}
export default function Statistics({ searchParams }: { searchParams: Promise<SearchParams> }) { return <Suspense fallback={<WorkspaceLoading title="Statistics" />}><StatisticsContent searchParams={searchParams} /></Suspense>; }
