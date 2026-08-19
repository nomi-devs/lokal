import { useTranslation } from "react-i18next";
import { Hourglass, CheckCircle2, XCircle, BadgeCheck } from "lucide-react";

import type { RefundStatus } from "@/data/refunds";
import { cn } from "@/lib/utils";

const statusStyle: Record<RefundStatus, { text: string; bg: string; icon: typeof Hourglass }> = {
  requested: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: Hourglass,
  },
  approved: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: CheckCircle2,
  },
  rejected: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
  },
  completed: {
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: BadgeCheck,
  },
};

export default function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const { t } = useTranslation();
  const { text, bg, icon: Icon } = statusStyle[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
        text,
        bg
      )}
    >
      <Icon className="w-3 h-3" />
      {t(`refunds.statusLabels.${status}`)}
    </span>
  );
}
