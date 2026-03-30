import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  return (
    <div
      className={`
        bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl
        transition-all duration-200
        ${paddings[padding]}
        ${hover ? "hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function CardHeader({ children, className = "", icon }: CardHeaderProps) {
  return (
    <div className={`flex items-center gap-3 pb-3 mb-3 border-b border-[var(--border)] ${className}`}>
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
          {icon}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export function CardTitle({ children, className = "", subtitle }: CardTitleProps) {
  return (
    <div>
      <h3 className={`text-base font-semibold text-[var(--text-primary)] ${className}`}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
