import { useCallback, useEffect, useRef, useState } from "react";
import { getCompletedProblems, subscribeProgress } from "../progress";

export function useLabProgress(userId: string | null) {
  const isMountedRef = useRef(true);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCompletedIds(new Set());
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      const completed = await getCompletedProblems(userId);
      if (!isMountedRef.current) return;
      setCompletedIds(new Set(completed));
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load progress.");
    } finally {
      if (!isMountedRef.current) return;
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    refresh();
    return () => {
      isMountedRef.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeProgress(() => {
      refresh();
    });
    return unsubscribe;
  }, [refresh, userId]);

  return {
    completedIds,
    isLoading,
    error,
    refresh,
  };
}
