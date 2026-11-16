"use client";

import { useState } from "react";
import Link from "next/link";
import type { StatisticsData, StatMetric } from "@/lib/dashboard-data";
import { formatValue } from "@/lib/scans/dates";

export function StatisticsPanel({ data }: { data: StatisticsData }) {
  const [selected, setSelected] = useState("ph");
  const options = [["ph", "pH"], ["moisture", "Moisture"], ["temperature", "Temperature"], ["npk", "NPK"], ["scans", "Scans"]];
  const metric = data[selected as "ph" | "moisture" | "temperature"] as StatMetric | undefined;
  const unit = selected === "moisture" ? "%" : selected === "temperature" ? "°C" : "pH";
  const maximum = metric ? Math.max(1, ...metric.bins.map((bin) => bin.count)) : 1;
  const chartMaximum = Math.max(1, ...data.timeline.map((bin) => bin.count));
  return <section className="panel statistics-panel">
    <div className="statistic-tabs" role="tablist" aria-label="Statistic to view">{options.map(([key, label]) => <button key={key} role="tab" aria-selected={selected === key} aria-controls="statistic-content" id={`statistic-${key}`} onClick={() => setSelected(key)}>{label}</button>)}</div>
    <div id="statistic-content" role="tabpanel" aria-labelledby={`statistic-${selected}`} className="statistic-content">
      {metric ? <><div className="statistic-summary"><div><span>Average</span><strong>{formatValue(metric.average)} <small>{unit}</small></strong></div><div><span>Lowest / highest</span><strong>{formatValue(metric.min)} / {formatValue(metric.max)}</strong></div><div><span>Readings / missing</span><strong>{metric.count} / {data.total - metric.count}</strong></div></div>
        <h2>Reading distribution</h2><div className="distribution">{metric.bins.map((bin) => <div key={bin.label}><span>{bin.label}</span><div className="distribution-track"><i style={{ width: `${bin.count / maximum * 100}%` }} /></div><strong>{bin.count.toLocaleString()}</strong></div>)}</div>
      </> : selected === "npk" ? <div className="npk-summary"><h2>Raw NPK records</h2><strong>{data.npkCount.toLocaleString()} <small>/ {data.total.toLocaleString()}</small></strong><Link className="text-link" href="/scans">View scans →</Link></div> : <><div className="statistic-summary"><div><span>Scans</span><strong>{data.total.toLocaleString()}</strong></div><div><span>Undated</span><strong>{data.unknownTime.toLocaleString()}</strong></div></div><h2>Scans over time</h2>{data.timeline.length ? <figure className="count-chart"><svg viewBox="0 0 640 160" role="img" aria-label="Scan counts over time">{data.timeline.map((bin, index) => { const width = 620 / data.timeline.length; const height = bin.count / chartMaximum * 125; return <rect key={bin.label} x={10 + index * width} y={140 - height} width={Math.max(2, width - 4)} height={height} rx="3" fill="#54846a"><title>{bin.label}: {bin.count} scans</title></rect>; })}</svg><figcaption><span>{data.timeline[0].label}</span><span>{data.timeline.at(-1)?.label}</span></figcaption></figure> : <p className="statistic-note">No scans</p>}</>}
    </div>
  </section>;
}
