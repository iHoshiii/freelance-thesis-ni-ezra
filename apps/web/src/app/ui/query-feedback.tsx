"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import { PageSkeleton } from "./page-skeleton";
import { useOnlineStatus } from "./use-online-status";

type QueryState = Pick<UseQueryResult, "isError" | "isPending" | "isPaused" | "dataUpdatedAt" | "error" | "refetch" | "isFetching">;
export function QueryFeedback({ query }: { query: QueryState }) {
  const offline = !useOnlineStatus() || query.isPaused;
  if (!query.isError && !offline) return null;
  const loadedAt = query.dataUpdatedAt > 0 ? new Date(query.dataUpdatedAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : null;
  return <div className="notice notice-warning query-feedback" role="status" title={loadedAt ? `Last loaded ${loadedAt}` : undefined}>
    <span>{offline ? "You're offline." : "Update failed."} Showing saved data.</span>
    {!offline && <button type="button" className="button button-small" disabled={query.isFetching} onClick={() => void query.refetch()}>Retry</button>}
  </div>;
}

export function QueryPlaceholder({ query, title }: { query: QueryState; title: string }) {
  const offline = !useOnlineStatus() || query.isPaused;
  if (query.isPending && !offline) return <PageSkeleton title={title} />;
  return <section className="query-empty" role="status"><h2>{offline ? "Offline" : "Data unavailable"}</h2><p>{offline ? "Reconnect to load this page." : query.error?.message ?? "Try again."}</p><div className="query-empty-actions"><button type="button" className="button button-primary" disabled={query.isFetching || offline} onClick={() => void query.refetch()}>Retry</button><Link className="text-link" href="/status">Status</Link></div></section>;
}
