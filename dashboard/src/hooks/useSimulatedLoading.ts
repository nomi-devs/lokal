import { useEffect, useState } from "react";

/**
 * Mimics the loading window of a real data fetch so skeleton states have
 * something to show. Swap for a real `isLoading` from your data layer
 * (e.g. `useQuery`) when wiring up a backend — call sites already read
 * this as a plain boolean, so nothing else changes.
 */
export function useSimulatedLoading(delayMs = 500) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return loading;
}
