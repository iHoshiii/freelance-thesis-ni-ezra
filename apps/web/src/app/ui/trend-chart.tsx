"use client";

import { useState } from "react";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { trendData, type Metric } from "@/lib/scans/trend";
import type { Scan } from "@/lib/scans/types";
import { Icon } from "./dashboard-icon";
import { useFitPage } from "./use-fit-page";

const metrics = [{ key: "ph", label: "Soil pH", unit: "pH" }, { key: "moisturePercent", label: "Moisture", unit: "%" }, { key: "temperatureC", label: "Temperature", unit: "°C" }] as const;

function TrendTable({ scans, metric, label }: { scans: Scan[]; metric: Metric; label: string }) {
  const { ref, capacity } = useFitPage(48, 34);
  const [offset, setOffset] = useState(0);
  const start = Math.min(offset, Math.max(0, scans.length - 1));
  return <div className="trend-data-page"><div className="table-scroll" ref={ref}><table><thead><tr><th scope="col">Scan</th><th scope="col">Scan time</th><th scope="col">{label}</th></tr></thead><tbody>{scans.slice(start, start + capacity).map((scan) => <tr key={`${scan.deviceId}/${scan.recordId}`}><td title={scan.sampleId}>{scan.sampleId}</td><td>{formatDate(scan.acquiredAt, true)}</td><td>{formatValue(scan[metric])}</td></tr>)}</tbody></table></div><div className="table-footer"><span>{start + 1}–{Math.min(start + capacity, scans.length)} of {scans.length}</span><div><button className="button button-small" disabled={start === 0} onClick={() => setOffset(Math.max(0, start - capacity))}>Previous</button><button className="button button-small" disabled={start + capacity >= scans.length} onClick={() => setOffset(start + capacity)}>Next</button></div></div></div>;
}

export function TrendChart({ scans, location }: { scans: Scan[]; location: string }) {
  const [metric, setMetric] = useState<Metric>("ph");
  const [showData, setShowData] = useState(false);
  const series = trendData(scans, metric);
  const selected = metrics.find((item) => item.key === metric)!;
  return <section className="panel trend-panel" aria-labelledby="trends-title">
    <div className="panel-heading"><div className="section-title"><span className="section-symbol"><Icon name="trend" /></span><div><h2 id="trends-title">Trends</h2><p>{location}</p></div></div><button className="button button-small" aria-pressed={showData} onClick={() => setShowData(!showData)}>{showData ? "View chart" : "View chart data"}</button></div>
    <div className="metric-tabs" role="group" aria-label="Chart reading">{metrics.map((item) => <button key={item.key} type="button" aria-pressed={metric === item.key} onClick={() => setMetric(item.key)}>{item.label}</button>)}</div>
    {!location || location === "__unassigned" ? <div className="chart-empty"><Icon name="location" /><p>Choose a location.</p></div> : series.count === 0 ? <div className="chart-empty"><Icon name="trend" /><p>No dated {selected.label.toLowerCase()} readings.</p></div> : showData ? <TrendTable scans={scans} metric={metric} label={`${selected.label} (${selected.unit})`} /> : <figure className="trend-figure">
      <svg viewBox="0 0 760 210" role="img" aria-label={`${selected.label} at ${location}: ${series.count} measured readings, from ${formatValue(series.min)} to ${formatValue(series.max)} ${selected.unit}.`}>
        <line x1="55" x2="720" y1="40" y2="40" className="chart-grid" /><line x1="55" x2="720" y1="105" y2="105" className="chart-grid" /><line x1="55" x2="720" y1="170" y2="170" className="chart-grid" />
        <text x="42" y="44" textAnchor="end">{formatValue(series.max)}</text><text x="42" y="174" textAnchor="end">{formatValue(series.min)}</text>
        {series.segments.map((segment, index) => <g key={index}>{segment.length > 1 && <polyline points={segment.map((point) => `${point.x},${point.y}`).join(" ")} className="chart-line" />}{segment.map((point) => <circle key={`${point.scan.deviceId}/${point.scan.recordId}`} cx={point.x} cy={point.y} r="3.5" className="chart-point"><title>{point.scan.sampleId}: {formatValue(point.scan[metric])} {selected.unit}, {formatDate(point.scan.acquiredAt)}</title></circle>)}</g>)}
        <text x="55" y="201">{formatDate(series.first, true)}</text><text x="720" y="201" textAnchor="end">{formatDate(series.last, true)}</text>
      </svg>
      <figcaption>{series.count} readings · Up to 200 scans · Gaps mean missing readings</figcaption>
    </figure>}
  </section>;
}
