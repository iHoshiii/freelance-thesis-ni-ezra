import type { Scan } from "@/lib/scans/types";
import { formatValue } from "@/lib/scans/dates";
import { Icon } from "./dashboard-icon";

export function ScanValues({ scan }: { scan: Scan | null }) {
  const readings = [
    { label: "Soil pH", value: scan?.ph, unit: "pH", icon: "ph" },
    { label: "Moisture", value: scan?.moisturePercent, unit: "%", icon: "droplet" },
    { label: "Temperature", value: scan?.temperatureC, unit: "°C", icon: "temperature" },
  ] as const;
  return <div className="reading-groups">
    {readings.map((item) => <div className="reading-group" key={item.label}><div className="reading-label"><span>{item.label}</span><Icon name={item.icon} /></div><div className="reading-value"><span>{formatValue(item.value)}</span><small>{item.unit}</small></div><span className="reading-hint">{item.value == null ? "No reading" : ""}</span></div>)}
    <div className="reading-group"><div className="reading-label"><span>Nutrients</span><Icon name="layers" /></div><div className="nutrient-grid">{(["n", "p", "k"] as const).map((key) => <div key={key}><small>{key.toUpperCase()}</small><strong>{formatValue(scan?.npkRaw?.[key])}</strong></div>)}</div><span className="reading-hint">{scan?.npkRaw?.unit ? `${scan.npkRaw.unit} · Provisional` : "Pending reference validation"}</span></div>
  </div>;
}
