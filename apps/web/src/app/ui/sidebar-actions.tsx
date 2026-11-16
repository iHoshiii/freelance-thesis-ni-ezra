"use client";

import { Icon } from "./dashboard-icon";

export function SidebarActions() {
  const actions = [
    { label: "Settings", icon: "settings" },
    { label: "Help", icon: "help" },
    { label: "How to use", icon: "guide" },
  ] as const;
  return <div className="sidebar-actions">
    <div className="sidebar-utilities" role="group" aria-label="Workspace tools">{actions.map((action) => <button type="button" key={action.label} aria-label={action.label} title={action.label}><Icon name={action.icon} /></button>)}</div>
    <button className="sidebar-logout" type="button" aria-label="Logout" title="Logout"><Icon name="logout" /><span className="nav-text">Logout</span></button>
  </div>;
}
