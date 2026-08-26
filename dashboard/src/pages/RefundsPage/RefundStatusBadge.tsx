import { useTranslation } from "react-i18next";
import { Hourglass, CheckCircle2, XCircle, BadgeCheck } from "lucide-react";

import type { RefundStatus } from "@/lib/refundsApi";
import Badge, { type BadgeVariant } from "@/components/ui/badge";

const statusConfig: Record<RefundStatus, { variant: BadgeVariant; icon: typeof Hourglass }> = {
  requested: { variant: "warning", icon: Hourglass },
  approved: { variant: "success", icon: CheckCircle2 },
  rejected: { variant: "danger", icon: XCircle },
  completed: { variant: "info", icon: BadgeCheck },
};

export default function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const { t } = useTranslation();
  const { variant, icon } = statusConfig[status];

  return (
    <Badge variant={variant} icon={icon}>
      {t(`refunds.statusLabels.${status}`)}
    </Badge>
  );
}
