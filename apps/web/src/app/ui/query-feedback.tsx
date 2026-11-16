"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import { PageSkeleton } from "./page-skeleton";
import { useOnlineStatus } from "./use-online-status";

type QueryState = Pick<UseQueryResult, "isError" | "isPending" | "isPaused" | "dataUpdatedAt" | "error" | "refetch" | "isFetching">;
export function QueryFeedback({ query, cached = true }: { query: QueryState; cached?: boolean }) {
  const offline = !useOnlineStatus() || query.isPaused;
  if (!query.isError && !offline) return null;
  return <div className="notice notice-warning query-feedback" role="status">
    <span>{offline ? "You're offline." : "Could not update this page."}{cached ? " Showing saved data." : " Check your connection and retry."}{cached && query.dataUpdatedAt > 0 && <small>Last loaded {new Date(query.dataUpdatedAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</small>}</span>
    <button type="button" className="button button-small" disabled={query.isFetching || offline} onClick={() => void query.refetch()}>Retry</button>
  </div>;
}

export function QueryPlaceholder({ query, title }: { query: QueryState; title: string }) {
  const offline = !useOnlineStatus() || query.isPaused;
  if (query.isPending && !offline) return <PageSkeleton title={title} />;
  return <><QueryFeedback query={query} cached={false} /><section className="panel query-empty"><h2>{offline ? "Waiting for a connection" : "Data unavailable"}</h2><p>{query.error?.message ?? "This page will update when your connection returns."}</p><Link className="text-link" href="/status">Open connection status</Link></section></>;
}
