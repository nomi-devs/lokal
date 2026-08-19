import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Hourglass, CheckCircle2, XCircle, Wallet, Eye } from "lucide-react";

import RefundDetailsDialog from "./RefundDetailsDialog";
import RefundApproveDialog from "./RefundApproveDialog";
import RefundRejectDialog from "./RefundRejectDialog";
import RefundStatusBadge from "./RefundStatusBadge";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { refunds as initialRefunds, type RefundRequest, type RefundStatus } from "@/data/refunds";

export default function RefundsPage() {
  const { t } = useTranslation();
  const [refundList, setRefundList] = useState<RefundRequest[]>(initialRefunds);

  const [viewTarget, setViewTarget] = useState<RefundRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<RefundRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RefundRequest | null>(null);

  function approve(refundId: string, proofOfTransferUrl: string, notes: string, reviewedBy: string) {
    const now = new Date().toISOString();

    setRefundList((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: "approved",
              approvedAt: now,
              approvedBy: reviewedBy,
              approvalNotes: notes || undefined,
              proofOfTransferUrl,
              rejectedAt: undefined,
              rejectionReason: undefined,
              rejectionCategory: undefined,
            }
          : r
      )
    );
    toast.success(t("refunds.messages.approved", { id: refundId }));
  }

  function reject(refundId: string, reason: string, category: string, internalNotes: string) {
    const now = new Date().toISOString();

    setRefundList((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              status: "rejected",
              rejectedAt: now,
              rejectionReason: internalNotes ? `${reason}\n\n${internalNotes}` : reason,
              rejectionCategory: category || undefined,
              approvedAt: undefined,
              approvedBy: undefined,
              approvalNotes: undefined,
              proofOfTransferUrl: undefined,
            }
          : r
      )
    );
    toast.success(t("refunds.messages.rejected", { id: refundId }));
  }

  const pendingCount = refundList.filter((r) => r.status === "requested").length;
  const approvedCount = refundList.filter((r) => r.status === "approved").length;
  const rejectedCount = refundList.filter((r) => r.status === "rejected").length;

  const totalAmount = refundList
    .filter((r) => r.status !== "rejected")
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const columns: ColumnDef<RefundRequest>[] = [
    { key: "orderId", header: t("refunds.orderId"), sortable: true },
    { key: "customerName", header: t("refunds.customerName"), sortable: true },
    {
      key: "refundAmount",
      header: t("refunds.amount"),
      sortable: true,
      render: (v) => `${(v as number).toFixed(2)} KWD`,
    },
    {
      key: "refundReason",
      header: t("refunds.reason"),
      render: (v) => <span className="truncate max-w-[220px] block">{v as string}</span>,
    },
    { key: "bankAccount", header: t("refunds.bank"), render: (_, row) => row.bankAccount.bankName },
    {
      key: "status",
      header: t("refunds.status"),
      sortable: true,
      render: (v) => <RefundStatusBadge status={v as RefundStatus} />,
    },
    {
      key: "requestedAt",
      header: t("refunds.requestedDate"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<RefundRequest>[] = [
    { label: t("refunds.viewDetails"), icon: Eye, onClick: (r) => setViewTarget(r) },
    {
      label: t("refunds.approve"),
      icon: CheckCircle2,
      onClick: (r) => setApproveTarget(r),
      hidden: (r) => r.status !== "requested",
    },
    {
      label: t("refunds.reject"),
      icon: XCircle,
      variant: "destructive",
      onClick: (r) => setRejectTarget(r),
      hidden: (r) => r.status !== "requested",
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("refunds.topbarTitle")}>
      <DataTable<RefundRequest>
        title={t("refunds.title")}
        data={refundList}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("refunds.search")}
        searchKeys={["orderId", "customerName"]}
        filters={[
          {
            key: "status",
            label: t("refunds.status"),
            options: (["requested", "approved", "rejected", "completed"] as RefundStatus[]).map(
              (s) => ({
                label: t(`refunds.statusLabels.${s}`),
                value: s,
              })
            ),
          },
        ]}
        rowActions={rowActions}
        rowActionsVariant="menu"
        pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
        defaultSort={{ key: "requestedAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("refunds.pending"),
            value: pendingCount,
            icon: Hourglass,
            variant: "warning",
          },
          {
            title: t("refunds.approved"),
            value: approvedCount,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("refunds.rejected"),
            value: rejectedCount,
            icon: XCircle,
            variant: "danger",
          },
          {
            title: t("refunds.totalAmount"),
            value: totalAmount.toLocaleString(),
            suffix: " KWD",
            icon: Wallet,
            variant: "primary",
          },
        ]}
        emptyState={{
          title: t("refunds.emptyTitle"),
          description: t("refunds.emptyDescription"),
        }}
      />

      <RefundDetailsDialog
        open={!!viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        refund={viewTarget}
      />
      <RefundApproveDialog
        open={!!approveTarget}
        onOpenChange={(o) => !o && setApproveTarget(null)}
        refund={approveTarget}
        onApprove={approve}
      />
      <RefundRejectDialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        refund={rejectTarget}
        onReject={reject}
      />
    </DashboardLayout>
  );
}
