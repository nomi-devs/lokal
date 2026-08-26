import { useTranslation } from "react-i18next";
import {
  Wallet,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Landmark,
  Hash,
  Building2,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";

import RefundStatusBadge from "./RefundStatusBadge";

import type { AdminRefund } from "@/lib/refundsApi";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
      <span className="text-sm font-semibold break-words">{value ?? "—"}</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: AdminRefund | null;
}

export default function RefundDetailsDialog({ open, onOpenChange, refund }: Props) {
  const { t } = useTranslation();

  if (!refund) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl min-h-[420px] max-h-[85vh] flex flex-col gap-0">
        <div className="flex items-center gap-4 px-6 py-5 border-b shrink-0">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold font-mono">{refund.orderNumber}</DialogTitle>
            <DialogDescription className="mt-0.5">
              {t("refunds.detailsDialog.title")}
            </DialogDescription>
          </div>
          <RefundStatusBadge status={refund.status} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Order & customer */}
          <div className="rounded-xl border p-5">
            <h3 className="text-sm font-semibold mb-4">{t("refunds.detailsDialog.orderInfo")}</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <InfoField icon={Hash} label={t("refunds.orderId")} value={refund.orderNumber} />
              <InfoField
                icon={User}
                label={t("refunds.detailsDialog.customer")}
                value={refund.customerName}
              />
              <InfoField
                icon={Mail}
                label={t("refunds.detailsDialog.customerEmail")}
                value={refund.customerEmail}
              />
              <InfoField
                icon={Wallet}
                label={t("refunds.detailsDialog.orderTotal")}
                value={`${refund.orderTotal.toFixed(2)} KWD`}
              />
            </div>
          </div>

          {/* Refund request */}
          <div className="rounded-xl border p-5">
            <h3 className="text-sm font-semibold mb-4">{t("refunds.detailsDialog.refundInfo")}</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <InfoField
                icon={Wallet}
                label={t("refunds.amount")}
                value={
                  <span className="text-destructive">-{refund.refundAmount.toFixed(2)} KWD</span>
                }
              />
              <InfoField
                icon={MessageSquare}
                label={t("refunds.reason")}
                value={refund.refundReason}
              />
              <InfoField
                icon={Calendar}
                label={t("refunds.requestedDate")}
                value={new Date(refund.createdAt).toLocaleString()}
              />
            </div>
            {refund.customerExplanation && (
              <div className="mt-4">
                <span className="text-xs text-muted-foreground">
                  {t("refunds.detailsDialog.customerExplanation")}
                </span>
                <p className="text-sm mt-1 rounded-lg bg-muted/50 p-3">
                  {refund.customerExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Bank account */}
          <div className="rounded-xl border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
              <Landmark className="w-4 h-4 text-primary" />
              {t("refunds.detailsDialog.bankAccount")}
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <InfoField
                icon={User}
                label={t("refunds.detailsDialog.accountHolder")}
                value={refund.bankAccount.accountHolder}
              />
              <InfoField
                icon={Hash}
                label={t("refunds.detailsDialog.accountNumber")}
                value={refund.bankAccount.accountNumber}
              />
              <InfoField
                icon={Building2}
                label={t("refunds.detailsDialog.bankName")}
                value={refund.bankAccount.bankName}
              />
              <InfoField
                icon={Hash}
                label={t("refunds.detailsDialog.bankCode")}
                value={refund.bankAccount.bankCode}
              />
            </div>
          </div>

          {/* Status & timeline */}
          <div className="rounded-xl border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
              <Clock className="w-4 h-4 text-primary" />
              {t("refunds.detailsDialog.timeline")}
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("refunds.requestedDate")}</span>
                <span className="font-medium">{new Date(refund.createdAt).toLocaleString()}</span>
              </div>
              {refund.approvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("refunds.approveDialog.approvalDate")}
                  </span>
                  <span className="font-medium">
                    {new Date(refund.approvedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {refund.rejectedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("refunds.detailsDialog.rejectedDate")}
                  </span>
                  <span className="font-medium">
                    {new Date(refund.rejectedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {refund.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("refunds.detailsDialog.completedDate")}
                  </span>
                  <span className="font-medium">
                    {new Date(refund.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {refund.status === "rejected" && refund.rejectionReason && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  {t("refunds.rejectDialog.reason")}
                </span>
                <p className="text-sm mt-1 rounded-lg bg-destructive/5 text-destructive p-3">
                  {refund.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Approval proof, shown once approved/completed */}
          {(refund.status === "approved" || refund.status === "completed") && (
            <div className="rounded-xl border p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t("refunds.detailsDialog.approvalDetails")}
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <InfoField
                  icon={Calendar}
                  label={t("refunds.approveDialog.approvalDate")}
                  value={
                    refund.approvedAt ? new Date(refund.approvedAt).toLocaleString() : undefined
                  }
                />
                {refund.proofOfTransferUrl && (
                  <InfoField
                    icon={LinkIcon}
                    label={t("refunds.approveDialog.proofUrl")}
                    value={
                      <a
                        href={refund.proofOfTransferUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {refund.proofOfTransferUrl}
                      </a>
                    }
                  />
                )}
              </div>
              {refund.approvalNotes && (
                <div className="mt-4">
                  <span className="text-xs text-muted-foreground">
                    {t("refunds.approveDialog.notes")}
                  </span>
                  <p className="text-sm mt-1 rounded-lg bg-muted/50 p-3">{refund.approvalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
