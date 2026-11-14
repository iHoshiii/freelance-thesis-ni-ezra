"use client";

import { useRef } from "react";
import Link from "next/link";
import { filterQuery } from "@/lib/scans/filters";
import type { ScanFilters } from "@/lib/scans/types";
import { Icon } from "./dashboard-icon";

export function ScanFilterControls({ filters, locations, path, today }: {
  filters: ScanFilters; locations: string[]; path: string; today: string;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const periods = [ ["all", "All"], ["today", "Today"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["custom", "Custom range"] ] as const;
  return <details className="history-controls" ref={disclosure}><summary>Filters</summary><div className="filter-body">
    <button className="filter-close" type="button" aria-label="Close filters" onClick={() => { if (disclosure.current) disclosure.current.open = false; }}><Icon name="close" /></button>
    <div className="period-tabs" aria-label="Scan date range">{periods.map(([period, label]) => <Link key={period} scroll={false} href={`${path}?${filterQuery(filters, { period, page: 1, ...(period === "custom" ? { from: filters.from || today, to: filters.to || today } : { from: "", to: "" }) })}`} aria-current={filters.period === period ? "true" : undefined}>{label}</Link>)}</div>
    <form className="filter-form" action={path} method="get">
      <input type="hidden" name="period" value={filters.period} />
      <label className="search-field"><Icon name="search" /><span className="sr-only">Search scan ID or location</span><input name="q" placeholder="Search scans or locations" defaultValue={filters.q} maxLength={120} /></label>
      <label className="select-field"><span className="sr-only">Sampling location</span><select name="location" defaultValue={filters.location}><option value="">All locations</option><option value="__unassigned">Unassigned</option>{locations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label>
      <label className="select-field date-basis"><span>Date by</span><select name="basis" defaultValue={filters.basis}><option value="scanned">Scan time</option><option value="uploaded">Upload time</option></select></label>
      {filters.period === "custom" && <div className="custom-dates"><label>From<input type="date" name="from" defaultValue={filters.from} required /></label><label>To<input type="date" name="to" defaultValue={filters.to} min={filters.from || undefined} required /></label></div>}
      <button className="button button-secondary" type="submit">Apply</button>
      {(filters.q || filters.location || filters.period !== "all" || filters.basis !== "scanned") && <Link className="reset-link" scroll={false} href={path}>Reset</Link>}
    </form>
    {filters.basis === "scanned" && filters.period !== "all" && <p className="filter-note">Unknown scan times: filter by upload time.</p>}
  </div></details>;
}
