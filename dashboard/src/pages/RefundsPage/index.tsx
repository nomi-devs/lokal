import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Hourglass, CheckCircle2, XCircle, Wallet, Eye, BadgeCheck } from "lucide-react";

import RefundDetailsDialog from "./RefundDetailsDialog";
import RefundApproveDialog from "./RefundApproveDialog";
import RefundRejectDialog from "./RefundRejectDialog";
import RefundCompleteDialog from "./RefundCompleteDialog";
import RefundStatusBadge from "./RefundStatusBadge";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  listAdminRefunds,
  approveRefund,
  rejectRefund,
  completeRefund,
  type AdminRefund,
  type RefundStatus,
} from "@/lib/refundsApi";

export default function RefundsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refundList, setRefundList] = useState<AdminRefund[]>([]);

  const [viewTarget, setViewTarget] = useState<AdminRefund | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminRefund | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminRefund | null>(null);
  const [completeTarget, setCompleteTarget] = useState<AdminRefund | null>(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminRefunds();
      setRefundList(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load refunds"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  async function approve(refundId: string, approvalNotes: string) {
    try {
      const updated = await approveRefund(refundId, approvalNotes || undefined);
      setRefundList((prev) => prev.map((r) => (r.id === refundId ? updated : r)));
      toast.success(t("refunds.messages.approved", { id: updated.orderNumber }));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function reject(refundId: string, reason: string, category: string) {
    try {
      const updated = await rejectRefund(refundId, reason, category || undefined);
      setRefundList((prev) => prev.map((r) => (r.id === refundId ? updated : r)));
      toast.success(t("refunds.messages.rejected", { id: updated.orderNumber }));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function complete(refundId: string, proofOfTransferUrl: string) {
    try {
      const updated = await completeRefund(refundId, proofOfTransferUrl);
      setRefundList((prev) => prev.map((r) => (r.id === refundId ? updated : r)));
      toast.success(
        t("refunds.messages.completed", {
          id: updated.orderNumber,
          defaultValue: "Refund for {{id}} marked as completed",
        })
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const pendingCount = refundList.filter((r) => r.status === "requested").length;
  const approvedCount = refundList.filter((r) => r.status === "approved").length;
  const rejectedCount = refundList.filter((r) => r.status === "rejected").length;

  const totalAmount = refundList
    .filter((r) => r.status !== "rejected")
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const columns: ColumnDef<AdminRefund>[] = [
    { key: "orderNumber", header: t("refunds.orderId"), sortable: true },
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
      key: "createdAt",
      header: t("refunds.requestedDate"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<AdminRefund>[] = [
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
    {
      label: t("refunds.completeDialog.confirm", "Mark completed"),
      icon: BadgeCheck,
      onClick: (r) => setCompleteTarget(r),
      hidden: (r) => r.status !== "approved",
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("refunds.topbarTitle")}>
      <DataTable<AdminRefund>
        title={t("refunds.title")}
        data={refundList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("refunds.search")}
        searchKeys={["orderNumber", "customerName"]}
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
        defaultSort={{ key: "createdAt", direction: "desc" }}
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
      <RefundCompleteDialog
        open={!!completeTarget}
        onOpenChange={(o) => !o && setCompleteTarget(null)}
        refund={completeTarget}
        onComplete={complete}
      />
    </DashboardLayout>
  );
}
