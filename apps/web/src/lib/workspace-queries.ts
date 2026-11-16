import { queryOptions } from "@tanstack/react-query";
import type { loadDashboard, StatisticsData } from "./dashboard-data";
import type { WorkspaceData } from "./scans/repository";
import type { ScanFilters } from "./scans/types";
import { filterQuery } from "./scans/filters";

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
export type HealthData = { server: string; database: string; schema: boolean; checkedAt: string };
export type StatisticsResponse = { statistics: StatisticsData | null; locations: string[]; lastUpload: string | null };

export async function fetchWorkspace<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? "The server could not finish this request.");
  }
  return response.json();
}

export const dashboardOptions = () => queryOptions({
  queryKey: ["workspace", "dashboard"],
  queryFn: ({ signal }) => fetchWorkspace<DashboardData>("/api/workspace?view=dashboard", signal),
  refetchInterval: 15000,
});
export const scansOptions = (filters: ScanFilters) => queryOptions({
  queryKey: ["workspace", "scans", filters], staleTime: 30000, refetchInterval: 30000,
  queryFn: ({ signal }) => fetchWorkspace<WorkspaceData>(`/api/workspace?view=scans&${filterQuery(filters)}`, signal),
});
export const statisticsOptions = (period: string, location: string) => queryOptions({
  queryKey: ["workspace", "statistics", { period, location }], staleTime: 60000, refetchInterval: 60000,
  queryFn: ({ signal }) => fetchWorkspace<StatisticsResponse>(`/api/workspace?${new URLSearchParams({ view: "statistics", period, location })}`, signal),
});
export const healthOptions = () => queryOptions({
  queryKey: ["workspace", "health"], staleTime: 0, gcTime: 60000, refetchInterval: 15000, retry: false,
  queryFn: ({ signal }) => fetchWorkspace<HealthData>("/api/health", signal),
});
