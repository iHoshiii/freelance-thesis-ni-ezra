import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: {
    staleTime: 15000, gcTime: 5 * 60 * 1000, retry: 1, retryDelay: 750,
    refetchOnWindowFocus: true, refetchOnReconnect: true,
  } } });
}

let browserClient: QueryClient | undefined;
export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  return browserClient ??= makeQueryClient();
}
