import Link from "next/link";
import type { Scan } from "@/lib/scans/types";
import { scanHref } from "@/lib/scans/types";
import { formatDate } from "@/lib/scans/dates";
import { Icon } from "./dashboard-icon";
import { ScanValues } from "./scan-values";

export function LatestScan({ scan }: { scan: Scan | null }) {
  return <section className="panel latest-scan" aria-labelledby="latest-title">
    <div className="panel-heading"><div className="section-title"><h2 id="latest-title">Last scan</h2>{scan && <span className="muted scan-name">{scan.sampleId}</span>}</div>{scan && <Link className="text-link" href={scanHref(scan)}>View scan <Icon name="arrow" /></Link>}</div>
    <ScanValues scan={scan} />
    {scan && <div className="scan-meta"><span><Icon name="location" />{scan.location ?? "Unassigned"}</span><span>Scanned <strong>{formatDate(scan.acquiredAt)}</strong></span><span>Uploaded <strong>{formatDate(scan.receivedAt)}</strong></span></div>}
  </section>;
}
