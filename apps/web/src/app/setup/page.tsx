import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { workspaceConfig } from "@/lib/workspace-config";
import { loadDevices } from "@/lib/scans/repository";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { Icon } from "../ui/dashboard-icon";

async function SetupContent() {
  await connection();
  const config = workspaceConfig();
  const data = await loadDevices();
  const checks = [
    { label: "Database connection setting", done: config.database, detail: config.database ? "DATABASE_URL is configured" : "Add DATABASE_URL to your local environment" },
    { label: "Workspace device list", done: config.valid, detail: config.valid ? `${config.deviceIds.length} device ID(s) configured` : "Set WORKSPACE_DEVICE_IDS to a comma-separated device list" },
    { label: "Database and device records", done: data.status === "ready" && data.devices.length > 0, detail: data.status === "ready" ? `${data.devices.length} configured device(s) found` : "Run database setup and provision a field unit" },
    { label: "First upload", done: Boolean(data.lastUpload), detail: data.lastUpload ? "A scan has reached this workspace" : "Upload a recorded scan using the device token" },
  ];
  return <WorkspaceShell current="/setup" title="Setup" lastUpload={data.lastUpload}>
    <div className="page-heading"><div><p className="eyebrow">GET STARTED</p><h1>Workspace setup</h1><p>Connect a field unit and receive your first scan.</p></div><Link className="button button-secondary" href="/">Open dashboard <Icon name="arrow" /></Link></div>
    <div className="setup-grid"><section className="panel setup-checks"><div className="panel-heading"><h2>Setup checklist</h2><span className="subtle-tag">{checks.filter((check) => check.done).length} / {checks.length}</span></div>{checks.map((check, index) => <div className="setup-check" key={check.label}><span className={`check-symbol ${check.done ? "complete" : ""}`}>{check.done ? <Icon name="check" /> : index + 1}</span><div><h3>{check.label}</h3><p>{check.detail}</p></div></div>)}</section>
    <section className="panel setup-context"><span className="advisor-symbol"><Icon name="device" /></span><h2>A shared research workspace</h2><p>No account is required. Anyone who can access this deployment can view the configured devices and their scans.</p><p>Device upload tokens and database credentials stay on the server or field unit. They are never shown in the dashboard.</p><span className="subtle-tag">Login can be added after paper approval</span></section></div>
    <section className="panel setup-steps"><div className="panel-heading"><h2>Connect your system</h2></div><ol>
      <li><h3>Configure PostgreSQL</h3><p>Add a Supabase PostgreSQL connection string to <code>DATABASE_URL</code>. Optionally use <code>DIRECT_URL</code> for setup commands. Supabase API keys are not database connection strings.</p></li>
      <li><h3>Prepare the database</h3><pre><code>npm run db:setup{`\n`}npm run db:generate{`\n`}npm run db:check</code></pre><p>The setup command applies the SQL migrations and supports devices without user accounts.</p></li>
      <li><h3>Provision a field unit</h3><pre><code>{`npm run device:provision -- soil-001 "Field unit" "${"$"}env:TEMP/soil-001.token"`}</code></pre><p>The token is saved to the specified file. Configure the field unit with its ID and token.</p></li>
      <li><h3>Choose this workspace&apos;s devices</h3><pre><code>WORKSPACE_DEVICE_IDS=soil-001</code></pre><p>Set this server-side variable in your environment, then restart the app. Use commas for multiple devices.</p></li>
      <li><h3>Upload a scan</h3><p>The device sends JSON to <code>POST /api/readings</code> with its bearer token. For a prepared development record:</p><pre><code>{`npm run device:upload -- "${"$"}env:TEMP/soil-001.token" ./scan.json`}</code></pre><p>Retain each device record until the server confirms its record ID.</p></li>
    </ol></section>
  </WorkspaceShell>;
}

export default function Setup() {
  return <Suspense fallback={<WorkspaceLoading />}><SetupContent /></Suspense>;
}
