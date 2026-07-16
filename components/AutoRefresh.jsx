"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Periodically re-fetches the server-rendered page data via router.refresh()
// (no full reload, client state preserved). Skips ticks while the tab is
// hidden, and refreshes once when it becomes visible again after being away.
export default function AutoRefresh({ intervalMs = 5 * 60 * 1000 }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  return null;
}
