"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_SIZE, scanHref, scanKey, type Scan, type ScanFilters } from "@/lib/scans/types";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { filterQuery } from "@/lib/scans/filters";
import { CompareDialog } from "./compare-dialog";
import { Icon } from "./dashboard-icon";
import { useFitPage } from "./use-fit-page";

export function ScanHistory({ scans, total, filters, path, ready, controls }: {
  scans: Scan[]; total: number; filters: ScanFilters; path: string; ready: boolean; controls: ReactNode;
}) {
  const [selected, setSelected] = useState<Scan[]>([]);
  const [offset, setOffset] = useState(0);
  const { ref, capacity } = useFitPage(68, 34);
  const start = Math.min(offset, Math.max(0, scans.length - 1));
  const visibleScans = scans.slice(start, start + capacity);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  function toggle(scan: Scan) {
    setSelected((current) => current.some((item) => scanKey(item) === scanKey(scan)) ? current.filter((item) => scanKey(item) !== scanKey(scan)) : current.length < 2 ? [...current, scan] : current);
  }
  return <section className="panel scan-history" id="scans" aria-labelledby="scans-title">
    <div className="panel-heading"><div className="section-title"><span className="section-symbol"><Icon name="history" /></span><h2 id="scans-title">Scans <span className="count">{total.toLocaleString()}</span></h2></div><div className="history-actions"><CompareDialog scans={selected} />{selected.length > 0 && <button className="reset-link" type="button" onClick={() => setSelected([])}>Clear selection</button>}{ready && total > 0 ? <a className="button button-secondary" href={`/api/scans/export?${filterQuery(filters)}`}><Icon name="download" />Export CSV</a> : <button className="button button-secondary" disabled><Icon name="download" />Export CSV</button>}</div></div>
    {controls}
    <div className="table-scroll" ref={ref}><table className="scan-table"><caption className="sr-only">Soil scan history. Select up to two scans to compare.</caption><thead><tr><th scope="col"><span className="sr-only">Compare</span></th><th scope="col">Scan</th><th scope="col">Location</th><th scope="col">Scanned / Uploaded</th><th scope="col" className="numeric">pH</th><th scope="col" className="numeric">Moisture</th><th scope="col" className="numeric">Temp.</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead><tbody>{visibleScans.map((scan) => {
      const checked = selected.some((item) => scanKey(item) === scanKey(scan));
      return <tr key={scanKey(scan)}><td><input type="checkbox" aria-label={`Compare ${scan.sampleId}`} checked={checked} disabled={!checked && selected.length >= 2} onChange={() => toggle(scan)} /></td><th scope="row"><Link href={scanHref(scan)} title={scan.sampleId}>{scan.sampleId}</Link><small className="desktop-scan-label">{scan.deviceLabel}</small><small className="mobile-scan-label">{scan.location ?? "Unassigned"} · {formatDate(scan.acquiredAt, true)}</small></th><td>{scan.location ?? <span className="muted">Unassigned</span>}</td><td><span>{formatDate(scan.acquiredAt, true)}</span><small>Uploaded {formatDate(scan.receivedAt, true)}</small></td><td className="numeric">{formatValue(scan.ph)}</td><td className="numeric">{formatValue(scan.moisturePercent)}<small className="inline-unit">%</small></td><td className="numeric">{formatValue(scan.temperatureC)}<small className="inline-unit">°C</small></td><td><Link className="row-link" href={scanHref(scan)} aria-label={`View ${scan.sampleId}`}><Icon name="arrow" /></Link></td></tr>;
    })}</tbody></table>{scans.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="sample" /></span><h3>{ready && (filters.q || filters.location || filters.period !== "all" || filters.page > 1) ? "No matching scans" : "No scans yet"}</h3><p>{ready ? "Uploaded readings will appear here." : "Complete device setup to receive readings."}</p></div>}</div>
    <div className="table-footer"><span>{total > 0 ? `${(filters.page - 1) * PAGE_SIZE + start + 1}–${(filters.page - 1) * PAGE_SIZE + start + visibleScans.length} of ${total}` : "0 scans"}</span><div>{start > 0 ? <button className="button button-small" onClick={() => setOffset(Math.max(0, start - capacity))}>Previous</button> : filters.page > 1 && <Link className="button button-small" scroll={false} href={`${path}?${filterQuery(filters, { page: filters.page - 1 })}`}>Previous</Link>}{start + capacity < scans.length ? <button className="button button-small" onClick={() => setOffset(start + capacity)}>Next</button> : filters.page < pages && <Link className="button button-small" scroll={false} href={`${path}?${filterQuery(filters, { page: filters.page + 1 })}`}>Next</Link>}</div><span className="table-timezone">UTC+8</span></div>
  </section>;
}
