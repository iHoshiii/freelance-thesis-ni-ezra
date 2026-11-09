import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { loadScan } from "@/lib/scans/repository";
import { formatDate } from "@/lib/scans/dates";
import { WorkspaceShell, WorkspaceLoading } from "../../../ui/workspace-shell";
import { ScanValues } from "../../../ui/scan-values";
import { Icon } from "../../../ui/dashboard-icon";

type Params = Promise<{ deviceId: string; recordId: string }>;

async function ScanContent({ params }: { params: Params }) {
  await connection();
  const ids = z.object({ deviceId: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/), recordId: z.uuid() }).safeParse(await params);
  if (!ids.success) notFound();
  const scan = await loadScan(ids.data.deviceId, ids.data.recordId);
  if (!scan) notFound();
  return <WorkspaceShell current="/scans" title="Scan details" lastUpload={scan.receivedAt}>
    <Link href="/scans" className="back-link">Back to scans</Link>
    <div className="page-heading"><div><p className="eyebrow">SCAN DETAILS</p><h1>{scan.sampleId}</h1><p>{scan.location ?? "Location unassigned"}</p></div><span className="subtle-tag">{scan.deviceLabel}</span></div>
    <section className="panel"><div className="panel-heading"><h2>Measurements</h2><span className="muted">{formatDate(scan.acquiredAt)}</span></div><ScanValues scan={scan} /></section>
    <div className="details-grid"><section className="panel record-panel"><div className="panel-heading"><h2>Scan record</h2><Icon name="sample" /></div><dl className="record-list"><div><dt>Scan ID</dt><dd>{scan.sampleId}</dd></div><div><dt>Location</dt><dd>{scan.location ?? "Unassigned"}</dd></div><div><dt>Device</dt><dd>{scan.deviceLabel} <small>{scan.deviceId}</small></dd></div><div><dt>Scanned</dt><dd>{formatDate(scan.acquiredAt)}</dd></div><div><dt>Uploaded</dt><dd>{formatDate(scan.receivedAt)}</dd></div><div><dt>Time quality</dt><dd>{scan.timeQuality === "synced" ? "Device clock synchronized" : "Measurement time unknown"}</dd></div><div><dt>Record ID</dt><dd className="record-id">{scan.recordId}</dd></div></dl></section>
    <section className="panel advisor-panel"><span className="advisor-symbol"><Icon name="sprout" /></span><h2>Fertilizer advisor</h2><p>Not available yet. The study model needs training and validation.</p><span className="subtle-tag">Awaiting model validation</span><details><summary>About these readings</summary><p>pH uses a prepared soil-water suspension. Moisture requires soil-specific calibration. NPK values are provisional until checked against reference measurements.</p></details></section></div>
  </WorkspaceShell>;
}

export default function ScanDetails({ params }: { params: Params }) {
  return <Suspense fallback={<WorkspaceLoading />}><ScanContent params={params} /></Suspense>;
}
