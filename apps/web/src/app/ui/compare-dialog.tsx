"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Scan } from "@/lib/scans/types";
import { scanHref, scanKey } from "@/lib/scans/types";
import { formatDate, formatValue } from "@/lib/scans/dates";
import { Icon } from "./dashboard-icon";

export function CompareDialog({ scans }: { scans: Scan[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const rows = [
    ["Location", (scan: Scan) => scan.location ?? "Unassigned"],
    ["Scan time", (scan: Scan) => formatDate(scan.acquiredAt)],
    ["Upload time", (scan: Scan) => formatDate(scan.receivedAt)],
    ["Soil pH", (scan: Scan) => formatValue(scan.ph)],
    ["Moisture (%)", (scan: Scan) => formatValue(scan.moisturePercent)],
    ["Temperature (°C)", (scan: Scan) => formatValue(scan.temperatureC)],
    ["N (provisional)", (scan: Scan) => `${formatValue(scan.npkRaw?.n)} ${scan.npkRaw?.unit ?? ""}`],
    ["P (provisional)", (scan: Scan) => `${formatValue(scan.npkRaw?.p)} ${scan.npkRaw?.unit ?? ""}`],
    ["K (provisional)", (scan: Scan) => `${formatValue(scan.npkRaw?.k)} ${scan.npkRaw?.unit ?? ""}`],
  ] as const;
  return <><button className="button button-secondary" type="button" disabled={scans.length !== 2} onClick={() => dialog.current?.showModal()}><Icon name="compare" />Compare{scans.length > 0 ? ` (${scans.length}/2)` : ""}</button><dialog ref={dialog} className="comparison-dialog" aria-labelledby="comparison-title"><div className="dialog-heading"><h2 id="comparison-title">Compare scans</h2><form method="dialog"><button className="icon-button" aria-label="Close comparison"><Icon name="close" /></button></form></div><div className="table-scroll"><table><caption className="sr-only">Two soil scans side by side</caption><thead><tr><th scope="col">Reading</th>{scans.map((scan) => <th scope="col" key={scanKey(scan)}><Link href={scanHref(scan)}>{scan.sampleId}</Link></th>)}</tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{scans.map((scan) => <td key={scanKey(scan)}>{value(scan)}</td>)}</tr>)}</tbody></table></div>{scans.length === 2 && scans[0].location !== scans[1].location && <p className="filter-note">These scans are from different sampling locations.</p>}</dialog></>;
}
