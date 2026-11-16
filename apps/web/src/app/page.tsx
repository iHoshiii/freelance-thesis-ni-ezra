import { Suspense } from "react";
import { OverviewDashboard } from "./ui/overview-dashboard";
import { WorkspaceLoading } from "./ui/workspace-shell";

export default function Home() {
  return <Suspense fallback={<WorkspaceLoading />}><OverviewDashboard /></Suspense>;
}
