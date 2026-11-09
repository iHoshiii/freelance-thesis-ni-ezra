import Link from "next/link";
import type { Scan } from "@/lib/scans/types";
import { scanHref } from "@/lib/scans/types";
import { formatDate } from "@/lib/scans/dates";
import { Icon } from "./dashboard-icon";
import { ScanValues } from "./scan-values";

export function LatestScan({ scan }: { scan: Scan | null }) {
  return <section className="panel latest-scan" aria-labelledby="latest-title">
    <div className="panel-heading"><div className="section-title"><span className="section-symbol"><Icon name="sample" /></span><div><h2 id="latest-title">Last scan</h2><p>{scan ? scan.sampleId : "Waiting for your first scan"}</p></div></div>{scan ? <Link className="text-link" href={scanHref(scan)}>View details <Icon name="arrow" /></Link> : <span className="subtle-tag">No scans yet</span>}</div>
    <ScanValues scan={scan} />
    <div className="scan-meta"><span><Icon name="location" />{scan?.location ?? "Location unassigned"}</span><span>Scanned <strong>{scan ? formatDate(scan.acquiredAt) : "Not yet"}</strong></span><span>Uploaded <strong>{scan ? formatDate(scan.receivedAt) : "Not yet"}</strong></span></div>
  </section>;
}
