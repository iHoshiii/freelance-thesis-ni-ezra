"use client";

import { useState, type ReactNode } from "react";

export function PanelSwitch({ labels, children }: { labels: string[]; children: ReactNode[] }) {
  const [selected, setSelected] = useState(0);
  return <div className="panel-switch">
    <div className="view-switch" role="group" aria-label="View">{labels.map((label, index) => <button key={label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{label}</button>)}</div>
    <div className="switch-content">{children[selected]}</div>
  </div>;
}
