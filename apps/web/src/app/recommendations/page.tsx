"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardOptions } from "@/lib/workspace-queries";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { scanHref } from "@/lib/scans/types";
import { soilGuidance } from "@/lib/soil-guidance";
import { WorkspaceShell } from "../ui/workspace-shell";
import { QueryFeedback, QueryPlaceholder } from "../ui/query-feedback";
import { Icon } from "../ui/dashboard-icon";

export default function Recommendations() {
  const query = useQuery(dashboardOptions());
  if (!query.data) return <WorkspaceShell current="/recommendations" title="Recommendations"><QueryPlaceholder query={query} title="Recommendations" /></WorkspaceShell>;
  const data = query.data.workspace;
  const scan = data.latest;
  return <WorkspaceShell current="/recommendations" title="Recommendations" lastUpload={data.lastUpload}><QueryFeedback query={query} />
    {scan && <div className="overview-heading"><span className="muted">{scan.location ?? "Unassigned"} · {formatDate(scan.acquiredAt, true)}</span><Link className="text-link" href={scanHref(scan)}>View scan <Icon name="arrow" /></Link></div>}
    {data.status === "unavailable" && <div className="notice notice-warning" role="status">Scan records unavailable. Check the database in Status.</div>}
    <div className="guidance-grid">{soilGuidance(scan).map((item) => <section className="guidance-card" key={item.key}><div className="guidance-title"><h2>{item.title}</h2><strong>{item.key === "npk" && scan?.npkRaw ? `${scan.npkRaw.n} / ${scan.npkRaw.p} / ${scan.npkRaw.k}` : item.value == null ? "--" : `${formatValue(item.value)} ${item.unit}`}</strong></div>{item.status && <span className="guidance-state">{item.status}</span>}{item.action && <p>{item.action}</p>}</section>)}</div>
  </WorkspaceShell>;
}
