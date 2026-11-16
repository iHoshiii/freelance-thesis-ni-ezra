"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !pending) startTransition(() => router.refresh());
    }, 15000);
    return () => clearInterval(timer);
  }, [router, pending]);
  return null;
}
