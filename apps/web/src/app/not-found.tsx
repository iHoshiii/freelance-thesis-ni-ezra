import Link from "next/link";
import { WorkspaceShell } from "./ui/workspace-shell";

export default function NotFound() {
  return <WorkspaceShell current="/scans" title="Not found"><section className="panel empty-state"><h1>Scan not found</h1><p>This record is not available in this workspace.</p><Link className="button button-primary" href="/scans">Back to scans</Link></section></WorkspaceShell>;
}
