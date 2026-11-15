import Link from "next/link";
import { Icon } from "./dashboard-icon";

export function DashboardNav({ current }: { current: string }) {
  const items = [
    { href: "/", label: "Overview", icon: "grid" },
    { href: "/scans", label: "Scans", icon: "history" },
    { href: "/recommendations", label: "Recommendations", icon: "sprout" },
    { href: "/statistics", label: "Statistics", icon: "trend" },
    { href: "/status", label: "Status", icon: "device" },
  ] as const;
  return <nav aria-label="Main navigation">{items.map((item) => <Link key={item.href} href={item.href} aria-label={item.label} title={item.label} aria-current={current === item.href ? "page" : undefined}><Icon name={item.icon} /><span className="nav-text">{item.label}</span></Link>)}</nav>;
}
