"use client";

import { useEffect, useState, useRef } from "react";

interface ProgressBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
  color?: "accent" | "success" | "error" | "warning";
  showPercent?: boolean;
}

export function ProgressBar({
  progress = 0,
  indeterminate = false,
  className = "",
  color = "accent",
  showPercent = false,
}: ProgressBarProps) {
  const [position, setPosition] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!indeterminate) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = (Math.sin(elapsed * 0.003) + 1) / 2;
      setPosition(p * 280);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [indeterminate]);

  const colors = {
    accent: "bg-[var(--accent)]",
    success: "bg-[var(--success)]",
    error: "bg-[var(--error)]",
    warning: "bg-[var(--warning)]",
  };

  return (
    <div className={`relative ${className}`}>
      <div className="h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
        {indeterminate ? (
          <div
            className={`h-full w-1/5 ${colors[color]} rounded-full transition-transform duration-75`}
            style={{ transform: `translateX(${position}%)` }}
          />
        ) : (
          <div
            className={`h-full ${colors[color]} rounded-full transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        )}
      </div>
      {showPercent && !indeterminate && (
        <span className="absolute right-0 -top-5 text-xs text-[var(--text-muted)]">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
