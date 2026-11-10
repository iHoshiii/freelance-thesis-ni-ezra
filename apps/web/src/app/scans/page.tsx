import { Suspense } from "react";
import type { SearchParams } from "@/lib/scans/types";
import { WorkspaceDashboard } from "../ui/workspace-dashboard";
import { WorkspaceLoading } from "../ui/workspace-shell";

export default function Scans({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <Suspense fallback={<WorkspaceLoading />}><WorkspaceDashboard searchParams={searchParams} scansOnly /></Suspense>;
}
