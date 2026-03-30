"use client";

import { ReactNode } from "react";
import { LoaderIcon } from "../icons";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

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
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base = `
    relative inline-flex items-center justify-center gap-2
    font-medium rounded-xl transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    active:scale-[0.98] disabled:pointer-events-none
  `;

  const variants = {
    primary: `
      bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white
      shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30
      focus-visible:ring-[var(--accent)]
      disabled:opacity-50
    `,
    secondary: `
      bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] 
      text-[var(--text-primary)] border border-[var(--border)]
      focus-visible:ring-[var(--accent)]
      disabled:opacity-50
    `,
    ghost: `
      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
      hover:bg-[var(--bg-hover)]
      focus-visible:ring-[var(--accent)]
      disabled:opacity-50
    `,
    danger: `
      bg-[var(--error)] hover:bg-red-600 text-white
      shadow-lg shadow-red-500/20
      focus-visible:ring-red-500
      disabled:opacity-50
    `,
    success: `
      bg-[var(--success)] hover:bg-green-600 text-white
      shadow-lg shadow-green-500/20
      focus-visible:ring-green-500
      disabled:opacity-50
    `,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <LoaderIcon className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
