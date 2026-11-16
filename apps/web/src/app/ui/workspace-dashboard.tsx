import { defaultFilters, parseFilters } from "@/lib/scans/filters";
import { connection } from "next/server";
import type { SearchParams } from "@/lib/scans/types";
import { ScansDashboard } from "./scans-dashboard";

export async function WorkspaceDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  let filters = defaultFilters;
  let filterError = "";
  try { filters = parseFilters(await searchParams); }
  catch (error) { filterError = error instanceof Error ? error.message : "Check the scan filters."; }
  return <ScansDashboard filters={filters} filterError={filterError} />;
}
