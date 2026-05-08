import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const PADDINGS: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps): React.ReactElement {
  return (
    <div className={`gd-card ${hover ? "gd-card-hover" : ""} ${PADDINGS[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function CardHeader({ children, className = "", icon }: CardHeaderProps): React.ReactElement {
  return (
    <div className={`flex items-center gap-3 pb-3 mb-3 border-b border-[var(--border)] gd-card-header ${className}`}>
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
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

export function CardTitle({ children, className = "", subtitle }: CardTitleProps): React.ReactElement {
  return (
    <div>
      <h3 className={`gd-title text-base text-[var(--text-primary)] ${className}`}>
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

export function CardContent({ children, className = "" }: CardContentProps): React.ReactElement {
  return <div className={className}>{children}</div>;
}
