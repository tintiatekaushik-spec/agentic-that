"use client";

import { useEffect, useState } from "react";

// True only after the component has mounted in the browser. Locale/clock
// dependent text (timeAgo, toLocaleTimeString) must be gated behind this,
// otherwise the SSR pass and the browser render different strings and React
// reports a hydration mismatch.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
