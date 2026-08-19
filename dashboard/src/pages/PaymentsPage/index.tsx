import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Landmark,
} from "lucide-react";

import PaymentFormDialog, { type PaymentFormValues } from "./PaymentFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import {
  payments as initialPayments,
  type Payment,
  type PaymentStatus,
  type PaymentMethod,
} from "@/data/payments";
import { orders } from "@/data/orders";
import { users } from "@/data/users";

const orderById = new Map(orders.map((o) => [o.id, o]));
const userById = new Map(users.map((u) => [u.id, u]));

const orderNumber = (p: Payment) => orderById.get(p.orderId)?.orderNumber ?? "—";

const customerName = (p: Payment) => {
  const u = userById.get(p.userId);

  return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
};
const customerEmail = (p: Payment) => userById.get(p.userId)?.email ?? "—";

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<PaymentStatus, string> = {
  success: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  pending: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  failed: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  refunded: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
};

const methodIcon: Record<PaymentMethod, typeof CreditCard> = {
  knet: Wallet,
  credit_card: CreditCard,
  debit_card: CreditCard,
};

// ── Confirm dialog state ───────────────────────────────────────────────────────
type PendingAction = { type: "delete"; payment: Payment } | null;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoading();
  const [paymentList, setPaymentList] = useState<Payment[]>(initialPayments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const successfulPayments = paymentList.filter((p) => p.status === "success");
  const successfulAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = paymentList.filter((p) => p.status === "pending").length;
  const failedCount = paymentList.filter((p) => p.status === "failed").length;

  function openEditDialog(payment: Payment) {
    setEditingPayment(payment);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: PaymentFormValues, editingId: number | null) {
    const orderId = Number(values.orderId);
    const userId = Number(values.userId);
    const now = new Date().toISOString();

    if (editingId != null) {
      setPaymentList((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, ...values, orderId, userId, updatedAt: now } : p
        )
      );
      toast.success(t("payments.list.toasts.edited", { transactionId: values.transactionId }));

      return;
    }

    const nextId = Math.max(0, ...paymentList.map((p) => p.id)) + 1;

    setPaymentList((prev) => [
      ...prev,
      {
        ...values,
        orderId,
        userId,
        id: nextId,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(t("payments.list.toasts.created", { transactionId: values.transactionId }));
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    const { payment } = pendingAction;

    setPaymentList((prev) => prev.filter((p) => p.id !== payment.id));
    toast.error(t("payments.list.toasts.deleted", { transactionId: payment.transactionId }));
  }

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      key: "transactionId",
      header: t("payments.list.columns.transaction"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.transactionId}</p>
          <p className="text-xs text-muted-foreground truncate">{orderNumber(row)}</p>
        </div>
      ),
    },
    {
      key: "orderId",
      header: t("payments.list.columns.order"),
      sortable: true,
      render: (_, row) => orderNumber(row),
    },
    {
      key: "userId",
      header: t("payments.list.columns.customer"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm truncate">{customerName(row)}</p>
          <p className="text-xs text-muted-foreground truncate">{customerEmail(row)}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: t("payments.list.columns.amount"),
      sortable: true,
      align: "right",
      render: (_, row) => (
        <span className="font-semibold">
          {row.amount.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      key: "method",
      header: t("payments.list.columns.method"),
      sortable: true,
      render: (v) => {
        const Icon = methodIcon[v as PaymentMethod];

        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Icon className="w-4 h-4 text-muted-foreground" />
            {t(`payments.method.${v as string}`, v as string)}
          </span>
        );
      },
    },
    {
      key: "gateway",
      header: t("payments.list.columns.gateway"),
      sortable: true,
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Landmark className="w-4 h-4 text-muted-foreground" />
          {t(`payments.gateway.${v as string}`, v as string)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("payments.list.columns.status"),
      sortable: true,
      render: (v) => (
        <span
          className={cn(
            "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
            statusStyle[v as PaymentStatus]
          )}
        >
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
    { key: "createdAt", header: t("payments.list.columns.date"), sortable: true },
  ];

  const paymentRowActions: RowAction<Payment>[] = [
    {
      label: t("common.actions.edit"),
      icon: Pencil,
      onClick: openEditDialog,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", payment: r }),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("payments.topbarTitle")}>
      <DataTable<Payment>
        title={t("payments.list.title")}
        description={t("payments.list.description")}
        data={paymentList}
        columns={paymentColumns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("payments.list.searchPlaceholder")}
        searchKeys={["transactionId"]}
        filters={[
          {
            key: "status",
            label: t("payments.list.filterStatus"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.success"), value: "success" },
              { label: t("common.status.failed"), value: "failed" },
              { label: t("common.status.refunded"), value: "refunded" },
            ],
          },
          {
            key: "method",
            label: t("payments.list.filterMethod"),
            options: [
              { label: t("payments.method.knet"), value: "knet" },
              { label: t("payments.method.credit_card"), value: "credit_card" },
              { label: t("payments.method.debit_card"), value: "debit_card" },
            ],
          },
        ]}
        rowActions={paymentRowActions}
        rowActionsVariant="inline"
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("payments.list.stats.total"),
            value: paymentList.length,
            icon: CreditCard,
            variant: "primary",
          },
          {
            title: t("payments.list.stats.successful"),
            value: successfulAmount.toLocaleString(),
            suffix: " KWD",
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("payments.list.stats.pending"),
            value: pendingCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("payments.list.stats.failed"),
            value: failedCount,
            icon: XCircle,
            variant: "danger",
          },
        ]}
        emptyState={{
          title: t("payments.list.emptyTitle"),
          description: t("payments.list.emptyDescription"),
        }}
      />

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={editingPayment}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={t("payments.list.confirm.deleteTitle")}
        description={
          pendingAction
            ? t("payments.list.confirm.deleteDescription", {
                transactionId: pendingAction.payment.transactionId,
              })
            : undefined
        }
        confirmLabel={t("common.actions.delete")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
