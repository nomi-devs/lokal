import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";

interface UseListDataOptions {
  /** Shown via toast.error on failure. Omit to fail silently (e.g. a secondary/derived stat). */
  fallbackMessage?: string;
}

// The fetch -> setLoading(true) -> try/setData -> catch toast.error ->
// finally setLoading(false) shape that was copy-pasted across nearly every
// admin/vendor list page. `refetch` is stable across renders (backed by a
// ref, not a dep array) so it only runs once on mount here — same as every
// call site's own `useEffect(() => { void load() }, [])` — while still being
// callable again later, e.g. after a create/update/delete.
export function useListData<T>(
  fetchFn: () => Promise<T>,
  initialValue: T,
  options: UseListDataOptions = {}
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const fallbackMessageRef = useRef(options.fallbackMessage);
  fallbackMessageRef.current = options.fallbackMessage;

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchFnRef.current());
    } catch (err) {
      if (fallbackMessageRef.current) {
        toast.error(getApiErrorMessage(err, fallbackMessageRef.current));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, setData, loading, refetch };
}
