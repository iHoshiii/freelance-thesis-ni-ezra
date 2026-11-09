"use client";

import { useSyncExternalStore } from "react";
import { Icon, type IconName } from "./dashboard-icon";

const sections: { id: string; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "history", label: "Samples", icon: "history" },
  { id: "advisory", label: "Fertilizer advisor", icon: "sprout" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot() {
  return window.location.hash.slice(1) || "overview";
}

export function DashboardNav() {
  const activeSection = useSyncExternalStore(subscribe, getSnapshot, () => "overview");
  return (
    <nav aria-label="Dashboard sections">
      {sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? "location" : undefined}><Icon name={section.icon} /><span>{section.label}</span></a>)}
    </nav>
  );
}
