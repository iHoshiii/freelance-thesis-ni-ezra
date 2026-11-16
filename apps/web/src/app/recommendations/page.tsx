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
  const hasReadings = scan && [scan.ph, scan.moisturePercent, scan.temperatureC, scan.npkRaw].some((value) => value != null);
  return <WorkspaceShell current="/recommendations" title="Recommendations" lastUpload={data.lastUpload}><QueryFeedback query={query} />
    {scan && <div className="overview-heading"><span className="muted">{scan.location ?? "Unassigned"} · {formatDate(scan.acquiredAt, true)}</span><Link className="text-link" href={scanHref(scan)}>View scan <Icon name="arrow" /></Link></div>}
    {data.status === "unavailable" ? <div className="notice notice-warning" role="status"><span>Scan records unavailable.</span><Link href="/status">Status <Icon name="arrow" /></Link></div>
      : <section className="guidance-grid recommendations" aria-label="Soil recommendations">{hasReadings ? soilGuidance(scan).map((item) => <article className="recommendation-row" key={item.key}><div className="recommendation-name"><h2>{item.title}</h2>{item.status && <span>{item.status}</span>}</div><div className="recommendation-value"><strong>{item.key === "npk" && scan?.npkRaw ? `${scan.npkRaw.n} / ${scan.npkRaw.p} / ${scan.npkRaw.k}` : item.value == null ? "--" : formatValue(item.value)}</strong>{item.value != null && <small>{item.unit}</small>}</div>{item.action && <p>{item.action}</p>}</article>)
        : <div className="recommendations-empty"><span className="recommendations-symbol"><Icon name="sprout" /></span><h2>{scan ? "This scan has no sensor data" : "No recommendations yet"}</h2><Link className="text-link" href={data.status === "setup" ? "/setup" : "/scans"}>{data.status === "setup" ? "Set up device" : "View scans"} <Icon name="arrow" /></Link></div>}</section>}
  </WorkspaceShell>;
}
