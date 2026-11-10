"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./dashboard-icon";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button className="icon-button" type="button" aria-label={pending ? "Refreshing scans" : "Refresh scans"} disabled={pending} onClick={() => startTransition(() => router.refresh())}><Icon name="refresh" /></button>;
}
