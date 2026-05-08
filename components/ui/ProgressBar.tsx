"use client";

import { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
  color?: "accent" | "success" | "error" | "warning";
  showPercent?: boolean;
}

const COLOR_FILL: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  accent: "linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)",
  success: "linear-gradient(90deg, var(--success) 0%, #15803d 100%)",
  error: "linear-gradient(90deg, var(--error) 0%, #991b1b 100%)",
  warning: "linear-gradient(90deg, var(--warning) 0%, #b45309 100%)",
};

const COLOR_GLOW: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  accent: "var(--accent-glow)",
  success: "rgba(86, 211, 100, 0.35)",
  error: "rgba(248, 81, 73, 0.35)",
  warning: "rgba(210, 153, 34, 0.35)",
};

export function ProgressBar({
  progress = 0,
  indeterminate = false,
  className = "",
  color = "accent",
  showPercent = false,
}: ProgressBarProps): React.ReactElement {
  const [position, setPosition] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!indeterminate) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const startTime = Date.now();
    const animate = (): void => {
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

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`relative ${className}`}>
      <div className="gd-progress-bar">
        {indeterminate ? (
          <div
            className="h-full w-1/5 rounded-[7px] transition-transform duration-75"
            style={{
              transform: `translateX(${position}%)`,
              background: COLOR_FILL[color],
              boxShadow: `0 0 8px ${COLOR_GLOW[color]}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
          />
        ) : (
          <div
            className="gd-progress-fill"
            style={{
              width: `${clampedProgress}%`,
              background: COLOR_FILL[color],
              boxShadow: `0 0 8px ${COLOR_GLOW[color]}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
          />
        )}
      </div>
      {showPercent && !indeterminate && (
        <span className="absolute right-0 -top-5 text-xs text-[var(--text-muted)] gd-title">
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}
