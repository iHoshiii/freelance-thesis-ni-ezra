import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./dashboard-icon";
import { SidebarPopupContent } from "./sidebar-popup-content";

export type SidebarPopupName = "Settings" | "Help" | "How to use";

export function SidebarPopup({ name, onClose }: { name: SidebarPopupName; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useRef(false);
  const title = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return createPortal(<dialog ref={dialog} className="sidebar-popup" aria-labelledby={title} onClose={() => { if (!dialog.current?.open) onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "Escape") event.stopPropagation();
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      const target = event.shiftKey && document.activeElement === first ? last : !event.shiftKey && document.activeElement === last ? first : null;
      if (target) { event.preventDefault(); target.focus(); }
    }}
    onPointerDown={(event) => { backdrop.current = event.target === event.currentTarget; }}
    onClick={(event) => { if (backdrop.current && event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="sidebar-popup-surface">
      <div className="sidebar-popup-heading"><h2 id={title}>{name}</h2><button type="button" className="icon-button" aria-label={`Close ${name}`} onClick={() => dialog.current?.close()} autoFocus><Icon name="close" /></button></div>
      <SidebarPopupContent name={name} onNavigate={() => dialog.current?.close()} />
    </div>
  </dialog>, document.body);
}
