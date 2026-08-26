import { useTranslation } from "react-i18next";

import type { PromoCodeStatus } from "@/lib/promoCodesApi";
import Badge, { type BadgeVariant } from "@/components/ui/badge";

const statusVariant: Record<PromoCodeStatus, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
  expired: "danger",
};

export default function PromoStatusBadge({ status }: { status: PromoCodeStatus }) {
  const { t } = useTranslation();

  return <Badge variant={statusVariant[status]}>{t(`promoCodes.statusLabels.${status}`)}</Badge>;
}

const discountTypeVariant: Record<"percentage" | "fixed", BadgeVariant> = {
  percentage: "info",
  fixed: "success",
};

export function DiscountTypeBadge({ type }: { type: "percentage" | "fixed" }) {
  const { t } = useTranslation();

  return (
    <Badge variant={discountTypeVariant[type]}>
      {t(`promoCodes.dialog.${type === "percentage" ? "percentage" : "fixedAmount"}`)}
    </Badge>
  );
}
