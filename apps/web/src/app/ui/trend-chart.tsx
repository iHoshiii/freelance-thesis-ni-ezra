"use client";

import { useState } from "react";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { trendData, type Metric } from "@/lib/scans/trend";
import type { Scan } from "@/lib/scans/types";
import { Icon } from "./dashboard-icon";

const metrics = [{ key: "ph", label: "Soil pH", unit: "pH" }, { key: "moisturePercent", label: "Moisture", unit: "%" }, { key: "temperatureC", label: "Temperature", unit: "°C" }] as const;

export function TrendChart({ scans, location }: { scans: Scan[]; location: string }) {
  const [metric, setMetric] = useState<Metric>("ph");
  const series = trendData(scans, metric);
  const selected = metrics.find((item) => item.key === metric)!;
  return <section className="panel trend-panel" aria-labelledby="trends-title"><div className="panel-heading"><div className="section-title"><span className="section-symbol"><Icon name="trend" /></span><div><h2 id="trends-title">Trends</h2><p>{location && location !== "__unassigned" ? location : "Compare readings from one sampling location"}</p></div></div><div className="metric-tabs" role="group" aria-label="Chart reading">{metrics.map((item) => <button key={item.key} type="button" aria-pressed={metric === item.key} onClick={() => setMetric(item.key)}>{item.label}</button>)}</div></div>
    {!location || location === "__unassigned" ? <div className="chart-empty"><Icon name="location" /><p>Choose a sampling location in the scan filters to see its trend.</p></div> : series.count === 0 ? <div className="chart-empty"><Icon name="trend" /><p>No dated {selected.label.toLowerCase()} readings in this range.</p></div> : <figure className="trend-figure"><svg viewBox="0 0 760 210" role="img" aria-label={`${selected.label} at ${location}: ${series.count} measured readings, from ${formatValue(series.min)} to ${formatValue(series.max)} ${selected.unit}.`}><line x1="55" x2="720" y1="40" y2="40" className="chart-grid" /><line x1="55" x2="720" y1="105" y2="105" className="chart-grid" /><line x1="55" x2="720" y1="170" y2="170" className="chart-grid" /><text x="42" y="44" textAnchor="end">{formatValue(series.max)}</text><text x="42" y="174" textAnchor="end">{formatValue(series.min)}</text>{series.segments.map((segment, index) => <g key={index}>{segment.length > 1 && <polyline points={segment.map((point) => `${point.x},${point.y}`).join(" ")} className="chart-line" />}{segment.map((point) => <circle key={`${point.scan.deviceId}/${point.scan.recordId}`} cx={point.x} cy={point.y} r="3.5" className="chart-point"><title>{point.scan.sampleId}: {formatValue(point.scan[metric])} {selected.unit}, {formatDate(point.scan.acquiredAt)}</title></circle>)}</g>)}<text x="55" y="201">{formatDate(series.first, true)}</text><text x="720" y="201" textAnchor="end">{formatDate(series.last, true)}</text></svg><figcaption>{series.count} measured readings · Latest 200 dated scans in the selected range · Missing values leave gaps</figcaption><details className="chart-data"><summary>View chart data</summary><div className="table-scroll"><table><thead><tr><th scope="col">Scan</th><th scope="col">Scan time</th><th scope="col">{selected.label} ({selected.unit})</th></tr></thead><tbody>{scans.map((scan) => <tr key={`${scan.deviceId}/${scan.recordId}`}><td>{scan.sampleId}</td><td>{formatDate(scan.acquiredAt)}</td><td>{formatValue(scan[metric])}</td></tr>)}</tbody></table></div></details></figure>}
  </section>;
}
