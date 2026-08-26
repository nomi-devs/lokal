import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "purple" | "neutral";

const badgeClass: Record<BadgeVariant, string> = {
  success: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  warning: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  danger: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  info: "text-sky-700 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30",
  purple: "text-violet-700 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
  neutral: "text-muted-foreground bg-muted",
};

const dotClass: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-red-500",
  info: "bg-sky-500",
  purple: "bg-violet-500",
  neutral: "bg-slate-400",
};

export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

// Shared status-pill primitive — centralizes the color vocabulary that used
// to be redefined per page (see e.g. OrdersPage/RefundsPage status maps),
// so a color only needs to be right once.
export default function Badge({ variant = "neutral", dot, icon: Icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
        badgeClass[variant],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass[variant])} />}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
