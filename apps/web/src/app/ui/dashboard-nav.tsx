import Link from "next/link";
import { Icon } from "./dashboard-icon";

export function DashboardNav({ current }: { current: string }) {
  const items = [
    { href: "/", label: "Overview", icon: "grid" },
    { href: "/scans", label: "Scans", icon: "history" },
    { href: "/devices", label: "Devices", icon: "device" },
    { href: "/setup", label: "Setup", icon: "info" },
  ] as const;
  return <nav aria-label="Main navigation">{items.map((item) => <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>;
}
