"use client";

import { ReactNode } from "react";
import { LoaderIcon } from "../icons";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "boosty";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  ariaLabel?: string;
}

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
  xl: "px-7 py-3.5 text-lg rounded-2xl gd-title",
};

const BASE_CLASSES =
  "relative inline-flex items-center justify-center gap-2 font-medium " +
  "transition-all duration-150 focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "gd-button-primary focus-visible:ring-[var(--accent)]",
  secondary:
    "bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] " +
    "border-2 border-[var(--border)] hover:border-[var(--accent)]/50 " +
    "focus-visible:ring-[var(--accent)]",
  ghost:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] " +
    "hover:bg-[var(--accent)]/10 focus-visible:ring-[var(--accent)]",
  danger: "gd-button-danger focus-visible:ring-red-500",
  success: "gd-button-success focus-visible:ring-green-500",
  boosty: "gd-button-boosty focus-visible:ring-orange-500",
};

export function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  icon,
  ariaLabel,
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`${BASE_CLASSES} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <>
          <LoaderIcon className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="inline-flex items-center justify-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
