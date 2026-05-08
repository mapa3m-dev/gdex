"use client";

import { useEffect, useRef, useState } from "react";

export interface UseCountUpOptions {
  durationMs?: number;
  startOnMount?: boolean;
}

export function useCountUp(
  target: number,
  { durationMs = 600, startOnMount = true }: UseCountUpOptions = {}
): number {
  const [value, setValue] = useState(startOnMount ? 0 : target);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (typeof target !== "number" || !Number.isFinite(target)) {
      setValue(0);
      return;
    }

    if (startedRef.current === false && startOnMount === false) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const from = startedRef.current ? value : 0;
    startedRef.current = true;

    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
