"use client";

// CareFlux - Custom Hooks

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Animates a number from 0 to target with ease-out easing.
 * Re-triggers whenever `target` changes.
 */
export function useAnimatedCounter(target: number, duration: number = 800): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const previousTarget = useRef(0);

  useEffect(() => {
    const from = previousTarget.current;
    const diff = target - from;

    if (diff === 0) return;

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + diff * eased);

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
        previousTarget.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return current;
}

/**
 * Polls a fetch function at the specified interval.
 * Returns the latest data, loading state, and any error.
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 3000
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const mountedRef = useRef(true);

  // Keep the latest fetchFn in ref to avoid re-triggering effect
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const doFetch = useCallback(async () => {
    try {
      const result = await fetchFnRef.current();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    doFetch();

    const interval = setInterval(doFetch, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [doFetch, intervalMs]);

  return { data, loading, error, refetch: doFetch };
}
