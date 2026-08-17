import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatsCardVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

export type StatsCardSize = "sm" | "md" | "lg";

export interface StatsCardTrend {
  value: number; // e.g. 12.5 → displays "+12.5%"
  label?: string; // e.g. "vs last month"
  positiveIsGood?: boolean; // default true — flips colour for inverse metrics (e.g. churn rate)
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string; // small helper text below the value
  icon?: LucideIcon;
  prefix?: string; // e.g. "$"
  suffix?: string; // e.g. "K", "%"
  trend?: StatsCardTrend;
  variant?: StatsCardVariant; // controls icon background accent colour
  size?: StatsCardSize;
  loading?: boolean; // shows skeleton placeholder
  footer?: React.ReactNode; // arbitrary content below a divider
  onClick?: () => void;
  className?: string;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const iconVariantClass: Record<StatsCardVariant, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

const sizeConfig: Record<
  StatsCardSize,
  { padding: string; title: string; value: string; iconWrap: string; iconSize: string }
> = {
  sm: {
    padding: "p-4",
    title: "text-xs",
    value: "text-xl font-bold",
    iconWrap: "h-9 w-9 rounded-lg p-2",
    iconSize: "h-4 w-4",
  },
  md: {
    padding: "p-5",
    title: "text-sm",
    value: "text-2xl font-bold",
    iconWrap: "h-11 w-11 rounded-xl p-2.5",
    iconSize: "h-5 w-5",
  },
  lg: {
    padding: "p-6",
    title: "text-sm",
    value: "text-3xl font-bold",
    iconWrap: "h-13 w-13 rounded-xl p-3",
    iconSize: "h-6 w-6",
  },
};

// ─── Trend sub-component ──────────────────────────────────────────────────────

function Trend({ trend }: { trend: StatsCardTrend }) {
  const { value, label = "vs last period", positiveIsGood = true } = trend;
  const isUp = value > 0;
  const isNeutral = value === 0;
  const isGood = positiveIsGood ? isUp : !isUp;

  const Icon = isNeutral ? Minus : isUp ? TrendingUp : TrendingDown;

  const colorClass = isNeutral
    ? "text-muted-foreground"
    : isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-500 dark:text-red-400";

  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", colorClass)}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {isNeutral ? "No change" : `${isUp ? "+" : ""}${value}%`}
      {label && <span className="text-muted-foreground font-normal">{label}</span>}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ size }: { size: StatsCardSize }) {
  const sc = sizeConfig[size];

  return (
    <div className={cn("animate-pulse", sc.padding)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className={cn("rounded-xl bg-muted shrink-0", sc.iconWrap)} />
      </div>
    </div>
  );
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  prefix,
  suffix,
  trend,
  variant = "default",
  size = "md",
  loading = false,
  footer,
  onClick,
  className,
}: StatsCardProps) {
  const sc = sizeConfig[size];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "bg-card text-card-foreground rounded-xl border shadow-sm",
        onClick &&
          "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {loading ? (
        <Skeleton size={size} />
      ) : (
        <>
          <div className={cn("flex items-start justify-between gap-4", sc.padding)}>
            {/* Left — text */}
            <div className="flex flex-col gap-1 min-w-0">
              <span className={cn("text-muted-foreground font-medium truncate", sc.title)}>
                {title}
              </span>
              <span className={cn("tracking-tight", sc.value)}>
                {prefix && <span className="text-muted-foreground font-normal">{prefix}</span>}
                {value}
                {suffix && (
                  <span className="text-muted-foreground font-normal ml-0.5">{suffix}</span>
                )}
              </span>
              {description && <span className="text-muted-foreground text-xs">{description}</span>}
              {trend && <Trend trend={trend} />}
            </div>

            {/* Right — icon */}
            {Icon && (
              <div
                className={cn(
                  "flex items-center justify-center shrink-0",
                  sc.iconWrap,
                  iconVariantClass[variant]
                )}
              >
                <Icon className={sc.iconSize} />
              </div>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-5 py-3 text-xs text-muted-foreground">{footer}</div>
          )}
        </>
      )}
    </div>
  );
}
