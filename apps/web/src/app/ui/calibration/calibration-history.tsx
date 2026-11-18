import { formatDate } from "@/lib/scans/dates";
import { signedOffset, type CalibrationProfile } from "@/lib/calibration/ph-offset";

export function CalibrationHistory({ profiles }: { profiles: CalibrationProfile[] }) {
  return <section className="panel calibration-history"><h2>Saved checks</h2><p className="calibration-muted">Last 20 checks for this device, stored in this browser. Saving does not confirm application on the ESP32.</p>
    {profiles.length ? <div className="calibration-checks">{profiles.slice(0, 3).map((profile) => <div key={profile.id}><span>{formatDate(profile.savedAt, true)}<small>{profile.measured.toFixed(2)} measured / {profile.reference.toFixed(2)} reference</small>{profile.notes && <small>{profile.notes}</small>}</span><strong>{signedOffset(profile.offset)}<small>new offset</small></strong></div>)}</div>
      : <p className="calibration-empty">No calibration checks saved for this device.</p>}
    {profiles.length > 3 && <details><summary>{profiles.length - 3} earlier checks</summary>{profiles.slice(3).map((profile) => <p key={profile.id}>{formatDate(profile.savedAt, true)}: {signedOffset(profile.offset)} pH</p>)}</details>}
  </section>;
}
