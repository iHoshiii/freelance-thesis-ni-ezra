"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Icon } from "./dashboard-icon";
import { useOnlineStatus } from "./use-online-status";

export function RefreshButton({ current = "/" }: { current?: string }) {
  const router = useRouter();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["workspace"] });
  const [pending, startTransition] = useTransition();
  const online = useOnlineStatus();
  const busy = pending || fetching > 0;
  function refresh() {
    void client.invalidateQueries({ queryKey: ["workspace"] });
    if (!["/", "/scans", "/recommendations", "/statistics", "/status"].includes(current)) startTransition(() => router.refresh());
  }
  return <button className={`icon-button${busy ? " is-spinning" : ""}`} type="button" aria-label={busy ? "Refreshing data" : "Refresh data"} title={online ? "Refresh data" : "Reconnect to refresh"} disabled={busy || !online} onClick={refresh}><Icon name="refresh" /></button>;
}

export function QueryActivity() {
  const fetching = useIsFetching({ queryKey: ["workspace"] });
  const loading = useIsFetching({ queryKey: ["workspace"], predicate: (query) => query.state.data === undefined });
  if (!fetching) return null;
  return <><div className="route-progress" aria-hidden="true" /><span className="query-activity" role="status"><Icon name="refresh" />{loading ? "Loading" : "Updating"}</span></>;
}
