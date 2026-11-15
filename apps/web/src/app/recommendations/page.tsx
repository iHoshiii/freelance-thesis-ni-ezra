import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { loadDevices } from "@/lib/scans/repository";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { scanHref } from "@/lib/scans/types";
import { soilGuidance } from "@/lib/soil-guidance";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { Icon, type IconName } from "../ui/dashboard-icon";

async function RecommendationContent() {
  await connection();
  const data = await loadDevices();
  const scan = data.latest;
  const icons: Record<string, IconName> = { ph: "ph", moisture: "droplet", temperature: "temperature", npk: "layers" };
  return <WorkspaceShell current="/recommendations" title="Recommendations" lastUpload={data.lastUpload}>
    <div className="overview-heading"><span className="muted">{scan ? `${scan.location ?? "Unassigned location"} · ${formatDate(scan.acquiredAt, true)}` : "Waiting for a scan"}</span>{scan && <Link className="text-link" href={scanHref(scan)}>View scan <Icon name="arrow" /></Link>}</div>
    {data.status === "unavailable" && <div className="notice notice-warning" role="status">Scan records unavailable. Check the database in Status.</div>}
    <div className="guidance-grid">{soilGuidance(scan).map((item) => <section className="panel guidance-card" key={item.key}><div className="guidance-title"><Icon name={icons[item.key]} /><h2>{item.title}</h2><strong>{item.key === "npk" && scan?.npkRaw ? `${scan.npkRaw.n} / ${scan.npkRaw.p} / ${scan.npkRaw.k}` : item.value == null ? "--" : `${formatValue(item.value)} ${item.unit}`}</strong></div><span className="guidance-state">{item.status}</span><p>{item.action}</p></section>)}</div>
    <div className="panel recommendation-note"><Icon name="info" /><div><h2>Next step: choose a crop & calibrate</h2><p>These are measurement checks. Crop-specific advice and fertilizer doses need a crop profile and validated readings.</p></div></div>
    <div className="workspace-footnote"><span>General references:</span><a href="https://extension.uconn.edu/publication/soil-fertility-management-for-vegetable-farms/" target="_blank" rel="noreferrer">Soil pH</a><a href="https://extension.umn.edu/natural-resources/conservation/agricultural-soil-and-water/irrigation/soil-moisture-sensors-for-irrigation-scheduling" target="_blank" rel="noreferrer">Moisture calibration</a></div>
  </WorkspaceShell>;
}
export default function Recommendations() { return <Suspense fallback={<WorkspaceLoading />}><RecommendationContent /></Suspense>; }
