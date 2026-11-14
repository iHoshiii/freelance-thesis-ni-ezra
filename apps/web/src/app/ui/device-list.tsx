"use client";

import { useState } from "react";
import Link from "next/link";
import type { DeviceSummary } from "@/lib/scans/types";
import { formatDate } from "@/lib/scans/dates";
import { useFitPage } from "./use-fit-page";

export function DeviceList({ devices }: { devices: DeviceSummary[] }) {
  const { ref, capacity } = useFitPage(212, 0, 250);
  const [offset, setOffset] = useState(0);
  const start = Math.min(offset, Math.max(0, devices.length - 1));
  return <section className="device-list"><div className="device-grid" ref={ref}>{devices.slice(start, start + capacity).map((device) => <article className="panel device-card" key={device.id}><h2 title={device.label}>{device.label}</h2><p>{device.id}</p><dl><div><dt>Scans</dt><dd>{device.scanCount.toLocaleString()}</dd></div><div><dt>Last contact</dt><dd>{device.lastContactAt ? formatDate(device.lastContactAt) : "No contact yet"}</dd></div></dl><Link href="/scans">View scans →</Link></article>)}</div><div className="table-footer"><span>{start + 1}–{Math.min(start + capacity, devices.length)} of {devices.length}</span><div><button className="button button-small" disabled={start === 0} onClick={() => setOffset(Math.max(0, start - capacity))}>Previous</button><button className="button button-small" disabled={start + capacity >= devices.length} onClick={() => setOffset(start + capacity)}>Next</button></div></div></section>;
}
