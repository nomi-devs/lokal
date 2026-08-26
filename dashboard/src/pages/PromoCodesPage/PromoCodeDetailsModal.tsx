import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Tag,
  Percent,
  DollarSign,
  Hash,
  Wallet,
  ShieldCheck,
  CalendarRange,
  User,
  Clock,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import PromoStatusBadge, { DiscountTypeBadge } from "./PromoStatusBadge";

import {
  type AdminPromoCode,
  getPromoCodeStatus,
  estimatedDiscountPerUse,
} from "@/lib/promoCodesApi";
import type { AdminVendorRow } from "@/lib/adminApi";
import type { AdminCategory } from "@/lib/adminApi";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function usagePercent(promo: AdminPromoCode): number | null {
  if (!promo.maxUsageCount) {
    return null;
  }

  return Math.round((promo.currentUsageCount / promo.maxUsageCount) * 1000) / 10;
}

function calculateDiscount(promo: AdminPromoCode, orderValue: number): number {
  if (promo.discountType === "fixed") {
    return Math.min(promo.discountValue, orderValue);
  }

  const uncapped = (promo.discountValue / 100) * orderValue;

  return promo.maxDiscountCap ? Math.min(uncapped, promo.maxDiscountCap) : uncapped;
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value ?? "—"}</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoCode: AdminPromoCode | null;
  vendorsById: Map<string, AdminVendorRow>;
  categoriesById: Map<string, AdminCategory>;
}

export default function PromoCodeDetailsModal({
  open,
  onOpenChange,
  promoCode,
  vendorsById,
  categoriesById,
}: Props) {
  const { t } = useTranslation();
  const [testOrderValue, setTestOrderValue] = useState("500");

  if (!promoCode) {
    return null;
  }

  const status = getPromoCodeStatus(promoCode);
  const usage = usagePercent(promoCode);
  const revenueSaved = Math.round(promoCode.currentUsageCount * estimatedDiscountPerUse(promoCode));

  const mostUsedTarget =
    promoCode.applicableCategoryIds.length > 0
      ? promoCode.applicableCategoryIds
          .map((id) => categoriesById.get(id)?.nameEn)
          .filter(Boolean)
          .join(", ")
      : promoCode.applicableVendorIds.length > 0
        ? promoCode.applicableVendorIds
            .map((id) => vendorsById.get(id)?.storeName)
            .filter(Boolean)
            .join(", ")
        : t("promoCodes.detailsModal.allProducts");

  const orderValue = Number(testOrderValue) || 0;
  const now = new Date();

  const isWithinDates =
    now >= new Date(promoCode.validFrom) && now <= new Date(promoCode.validUntil);
  const meetsMinOrder = !promoCode.minOrderValue || orderValue >= promoCode.minOrderValue;

  const withinUsageLimit =
    !promoCode.maxUsageCount || promoCode.currentUsageCount < promoCode.maxUsageCount;
  const testIsValid = promoCode.isActive && isWithinDates && meetsMinOrder && withinUsageLimit;
  const testDiscount = testIsValid ? calculateDiscount(promoCode, orderValue) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl min-h-[420px] max-h-[85vh] flex flex-col gap-0">
        <div className="flex items-center gap-4 px-6 py-5 border-b shrink-0">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold font-mono">{promoCode.code}</DialogTitle>
            <DialogDescription className="mt-0.5">
              {t("promoCodes.detailsModal.title")}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DiscountTypeBadge type={promoCode.discountType} />
            <PromoStatusBadge status={status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Basic info */}
          <div className="rounded-xl border p-5">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <InfoField
                icon={promoCode.discountType === "percentage" ? Percent : DollarSign}
                label={t("promoCodes.dialog.discountValue")}
                value={
                  promoCode.discountType === "percentage"
                    ? `${promoCode.discountValue}%`
                    : `${promoCode.discountValue} KWD`
                }
              />
              <InfoField
                icon={Hash}
                label={t("promoCodes.detailsModal.usage")}
                value={
                  promoCode.maxUsageCount
                    ? `${promoCode.currentUsageCount}/${promoCode.maxUsageCount} (${usage}%)`
                    : t("promoCodes.dialog.currentUsageUnlimited", {
                        used: promoCode.currentUsageCount,
                      })
                }
              />
              <InfoField
                icon={Wallet}
                label={t("promoCodes.detailsModal.revenueSaved")}
                value={`${revenueSaved.toLocaleString()} KWD`}
              />
              <InfoField
                icon={ShieldCheck}
                label={t("promoCodes.detailsModal.mostUsedBy")}
                value={mostUsedTarget}
              />
              <InfoField
                icon={CalendarRange}
                label={t("promoCodes.columns.validUntil")}
                value={new Date(promoCode.validUntil).toLocaleDateString()}
              />
              <InfoField
                icon={Clock}
                label={t("promoCodes.detailsModal.lastUsed")}
                value={
                  promoCode.lastUsedAt
                    ? new Date(promoCode.lastUsedAt).toLocaleString()
                    : t("promoCodes.detailsModal.neverUsed")
                }
              />
              <InfoField
                icon={User}
                label={t("promoCodes.detailsModal.createdBy")}
                value={promoCode.createdBy}
              />
              <InfoField
                icon={CalendarRange}
                label={t("promoCodes.detailsModal.createdDate")}
                value={new Date(promoCode.createdAt).toLocaleDateString()}
              />
            </div>
          </div>

          {/* Test promo code */}
          <div className="rounded-xl border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
              <FlaskConical className="w-4 h-4 text-primary" />
              {t("promoCodes.detailsModal.testTitle")}
            </h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="mb-1.5 block">
                  {t("promoCodes.detailsModal.testOrderValue")}
                </Label>
                <Input
                  type="number"
                  min={0}
                  className="h-10"
                  value={testOrderValue}
                  onChange={(e) => setTestOrderValue(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-muted/50 p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("promoCodes.detailsModal.expectedDiscount")}
                </span>
                <span className="font-semibold text-destructive">
                  -{testDiscount.toFixed(2)} KWD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("promoCodes.detailsModal.finalTotal")}
                </span>
                <span className="font-semibold">
                  {Math.max(orderValue - testDiscount, 0).toFixed(2)} KWD
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 pt-2 border-t mt-1 text-xs font-medium",
                  testIsValid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}
              >
                {testIsValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {testIsValid
                  ? t("promoCodes.detailsModal.testValid")
                  : t("promoCodes.detailsModal.testInvalid")}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
