"use client";

import { useState } from "react";
import { Icon } from "./dashboard-icon";
import { SidebarPopup, type SidebarPopupName } from "./sidebar-popup";

export function SidebarActions() {
  const [active, setActive] = useState<SidebarPopupName | null>(null);
  const actions = [
    { label: "Settings", icon: "settings" },
    { label: "Help", icon: "help" },
    { label: "How to use", icon: "guide" },
  ] as const;
  return <div className="sidebar-actions">
    <div className="sidebar-utilities" role="group" aria-label="Workspace tools">{actions.map((action) => <button type="button" key={action.label} aria-label={action.label} title={action.label} aria-haspopup="dialog" aria-expanded={active === action.label} onClick={() => setActive(action.label)}><Icon name={action.icon} /></button>)}</div>
    <button className="sidebar-logout" type="button" aria-label="Logout" title="Logout"><Icon name="logout" /><span className="nav-text">Logout</span></button>
    {active && <SidebarPopup name={active} onClose={() => setActive(null)} />}
  </div>;
}
