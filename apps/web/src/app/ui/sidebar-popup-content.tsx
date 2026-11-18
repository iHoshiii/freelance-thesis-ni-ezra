import Link from "next/link";
import { Icon } from "./dashboard-icon";
import type { SidebarPopupName } from "./sidebar-popup";

export function SidebarPopupContent({ name, onNavigate }: { name: SidebarPopupName; onNavigate: () => void }) {
  if (name === "Settings") return <div className="sidebar-popup-links">
    <Link href="/configuration" onClick={onNavigate}><span><strong>Configuration</strong><small>Calibrate the pH calculation</small></span><Icon name="arrow" /></Link>
    <Link href="/devices" onClick={onNavigate}><span><strong>Devices</strong><small>View your field units</small></span><Icon name="arrow" /></Link>
    <Link href="/setup" onClick={onNavigate}><span><strong>Workspace setup</strong><small>Connect your device and database</small></span><Icon name="arrow" /></Link>
  </div>;
  if (name === "Help") return <div className="sidebar-popup-help">
    <details><summary>Why are there no scans?</summary><p>Check that your device is set up and has uploaded a scan.</p></details>
    <details><summary>What does -- mean?</summary><p>A reading or device report is not available yet.</p></details>
    <details><summary>Why is syncing delayed?</summary><p>Check the device connection and the server status.</p></details>
    <Link className="text-link sidebar-popup-link" href="/status" onClick={onNavigate}>Check Status <Icon name="arrow" /></Link>
  </div>;
  const steps = [
    ["Set up your device", "Follow the checklist in Setup."],
    ["Scan your soil", "Take a reading with your field unit."],
    ["Sync your scans", "Connect the device to upload its stored scans."],
    ["Review your results", "Open Scans for readings and CSV export. Check Recommendations and Statistics for more detail."],
  ];
  return <><ol className="sidebar-popup-steps">{steps.map(([heading, text]) => <li key={heading}><strong>{heading}</strong><p>{text}</p></li>)}</ol><Link className="text-link sidebar-popup-link" href="/scans" onClick={onNavigate}>Open Scans <Icon name="arrow" /></Link></>;
}
