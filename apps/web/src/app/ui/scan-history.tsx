"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_SIZE, scanHref, scanKey, type Scan, type ScanFilters } from "@/lib/scans/types";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { filterQuery } from "@/lib/scans/filters";
import { CompareDialog } from "./compare-dialog";
import { Icon } from "./dashboard-icon";

export function ScanHistory({ scans, total, filters, path, ready, controls }: {
  scans: Scan[]; total: number; filters: ScanFilters; path: string; ready: boolean; controls: ReactNode;
}) {
  const [selected, setSelected] = useState<Scan[]>([]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  function toggle(scan: Scan) {
    setSelected((current) => current.some((item) => scanKey(item) === scanKey(scan)) ? current.filter((item) => scanKey(item) !== scanKey(scan)) : current.length < 2 ? [...current, scan] : current);
  }
  return <section className="panel scan-history" id="scans" aria-labelledby="scans-title">
    <div className="panel-heading"><div className="section-title"><span className="section-symbol"><Icon name="history" /></span><h2 id="scans-title">Scans <span className="count">{total.toLocaleString()}</span></h2></div><div className="history-actions"><CompareDialog scans={selected} />{selected.length > 0 && <button className="reset-link" type="button" onClick={() => setSelected([])}>Clear selection</button>}{ready && total > 0 ? <a className="button button-secondary" href={`/api/scans/export?${filterQuery(filters)}`}><Icon name="download" />Export CSV</a> : <button className="button button-secondary" disabled><Icon name="download" />Export CSV</button>}</div></div>
    {controls}
    <div className="table-scroll"><table className="scan-table"><caption className="sr-only">Soil scan history. Select up to two scans to compare.</caption><thead><tr><th scope="col"><span className="sr-only">Compare</span></th><th scope="col">Scan</th><th scope="col">Location</th><th scope="col">Scanned / Uploaded</th><th scope="col" className="numeric">pH</th><th scope="col" className="numeric">Moisture</th><th scope="col" className="numeric">Temp.</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead><tbody>{scans.map((scan) => {
      const checked = selected.some((item) => scanKey(item) === scanKey(scan));
      return <tr key={scanKey(scan)}><td><input type="checkbox" aria-label={`Compare ${scan.sampleId}`} checked={checked} disabled={!checked && selected.length >= 2} onChange={() => toggle(scan)} /></td><th scope="row"><Link href={scanHref(scan)}>{scan.sampleId}</Link><small>{scan.deviceLabel}</small></th><td>{scan.location ?? <span className="muted">Unassigned</span>}</td><td><span>{formatDate(scan.acquiredAt, true)}</span><small>Uploaded {formatDate(scan.receivedAt, true)}</small></td><td className="numeric">{formatValue(scan.ph)}</td><td className="numeric">{formatValue(scan.moisturePercent)}<small className="inline-unit">%</small></td><td className="numeric">{formatValue(scan.temperatureC)}<small className="inline-unit">°C</small></td><td><Link className="row-link" href={scanHref(scan)} aria-label={`View ${scan.sampleId}`}><Icon name="arrow" /></Link></td></tr>;
    })}</tbody></table>{scans.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="sample" /></span><h3>{ready && (filters.q || filters.location || filters.period !== "all" || filters.page > 1) ? "No matching scans" : "No scans yet"}</h3><p>{ready ? "Uploaded readings will appear here." : "Complete device setup to receive readings."}</p></div>}</div>
    <div className="table-footer"><span>{total > 0 ? `Page ${filters.page} of ${pages}` : "0 scans"}</span><div>{filters.page > 1 && <Link className="button button-small" href={`${path}?${filterQuery(filters, { page: filters.page - 1 })}#scans`}>Previous</Link>}{filters.page < pages && <Link className="button button-small" href={`${path}?${filterQuery(filters, { page: filters.page + 1 })}#scans`}>Next</Link>}</div><span className="table-timezone">Philippine time · UTC+8</span></div>
  </section>;
}
