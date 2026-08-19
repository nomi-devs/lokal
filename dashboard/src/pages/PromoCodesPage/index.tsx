import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tag, Plus, Pencil, Trash2, Eye, Hash, Wallet } from "lucide-react";

import PromoCodeFormDialog, { type PromoCodeFormValues } from "./PromoCodeFormDialog";
import PromoCodeDetailsModal from "./PromoCodeDetailsModal";
import PromoStatusBadge, { DiscountTypeBadge } from "./PromoStatusBadge";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  promoCodes as initialPromoCodes,
  type PromoCode,
  type PromoCodeStatus,
  getPromoCodeStatus,
  estimatedDiscountPerUse,
} from "@/data/promoCodes";

type PromoCodeRow = PromoCode & { computedStatus: PromoCodeStatus; isValid: boolean };

function toRow(promo: PromoCode): PromoCodeRow {
  const status = getPromoCodeStatus(promo);

  return {
    ...promo,
    computedStatus: status,
    isValid: status !== "expired",
  };
}

type PendingAction =
  | { type: "delete"; promoCode: PromoCode }
  | { type: "deleteSelected"; promoCodes: PromoCode[] }
  | null;

export default function PromoCodesPage() {
  const { t } = useTranslation();
  const [promoCodeList, setPromoCodeList] = useState<PromoCode[]>(initialPromoCodes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [viewingPromoCode, setViewingPromoCode] = useState<PromoCode | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const rows = useMemo(() => promoCodeList.map(toRow), [promoCodeList]);

  const activeCount = rows.filter((r) => r.computedStatus === "active").length;
  const totalUsage = promoCodeList.reduce((sum, p) => sum + p.currentUsageCount, 0);

  const revenueImpact = Math.round(
    promoCodeList.reduce((sum, p) => sum + p.currentUsageCount * estimatedDiscountPerUse(p), 0)
  );

  function openAddDialog() {
    setEditingPromoCode(null);
    setDialogOpen(true);
  }

  function openEditDialog(promo: PromoCode) {
    setEditingPromoCode(promo);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: PromoCodeFormValues, editingId: number | null) {
    const now = new Date().toISOString();

    const shared = {
      code: values.code,
      discountType: values.discountType,
      discountValue: values.discountValue,
      validFrom: values.validFrom,
      validUntil: values.validUntil,
      isActive: values.isActive,
    };

    if (editingId != null) {
      // The form only edits the fields above — usage limits, conditions, and applicability
      // (set elsewhere, or not yet exposed in the simplified form) are left untouched.
      setPromoCodeList((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, ...shared, updatedAt: now, updatedBy: "admin@gmail.com" } : p
        )
      );
      toast.success(t("promoCodes.messages.updated"));

      return;
    }

    const nextId = Math.max(0, ...promoCodeList.map((p) => p.id)) + 1;

    setPromoCodeList((prev) => [
      ...prev,
      {
        ...shared,
        id: nextId,
        currentUsageCount: 0,
        applicableToVendors: [],
        applicableToCategories: [],
        createdAt: now,
        createdBy: "admin@gmail.com",
        updatedAt: now,
      },
    ]);
    toast.success(t("promoCodes.messages.created"));
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      const { promoCode } = pendingAction;

      setPromoCodeList((prev) => prev.filter((p) => p.id !== promoCode.id));
      toast.success(t("promoCodes.messages.deleted"));
    } else {
      const ids = new Set(pendingAction.promoCodes.map((p) => p.id));

      setPromoCodeList((prev) => prev.filter((p) => !ids.has(p.id)));
      toast.success(
        t("promoCodes.messages.deletedSelected", { count: pendingAction.promoCodes.length })
      );
    }
  }

  const columns: ColumnDef<PromoCodeRow>[] = [
    {
      key: "code",
      header: t("promoCodes.columns.code"),
      sortable: true,
      render: (v, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewingPromoCode(row);
          }}
          className="font-mono font-semibold text-sm text-primary hover:underline"
        >
          {v as string}
        </button>
      ),
    },
    {
      key: "discountType",
      header: t("promoCodes.columns.discountType"),
      sortable: true,
      render: (v) => <DiscountTypeBadge type={v as "percentage" | "fixed"} />,
    },
    {
      key: "discountValue",
      header: t("promoCodes.columns.discountValue"),
      sortable: true,
      render: (_, row) =>
        row.discountType === "percentage" ? `${row.discountValue}%` : `${row.discountValue} KWD`,
    },
    {
      key: "currentUsageCount",
      header: t("promoCodes.columns.usage"),
      sortable: true,
      render: (_, row) =>
        row.maxUsageCount
          ? `${row.currentUsageCount}/${row.maxUsageCount}`
          : `${row.currentUsageCount}/∞`,
    },
    {
      key: "computedStatus",
      header: t("promoCodes.columns.status"),
      sortable: true,
      render: (v) => <PromoStatusBadge status={v as PromoCodeStatus} />,
    },
    {
      key: "validUntil",
      header: t("promoCodes.columns.validUntil"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<PromoCodeRow>[] = [
    { label: t("promoCodes.view"), icon: Eye, onClick: (r) => setViewingPromoCode(r) },
    { label: t("promoCodes.edit"), icon: Pencil, onClick: openEditDialog },
    {
      label: t("promoCodes.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", promoCode: r }),
    },
  ];

  const toolbarActions: ToolbarAction<PromoCodeRow>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (selected) => setPendingAction({ type: "deleteSelected", promoCodes: selected }),
    },
    {
      label: t("promoCodes.createNew"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("promoCodes.topbarTitle")}>
      <DataTable<PromoCodeRow>
        title={t("promoCodes.title")}
        data={rows}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("promoCodes.search")}
        searchKeys={["code"]}
        filters={[
          {
            key: "computedStatus",
            label: t("promoCodes.status"),
            options: (["active", "inactive", "expired"] as PromoCodeStatus[]).map((s) => ({
              label: t(`promoCodes.statusLabels.${s}`),
              value: s,
            })),
          },
          {
            key: "discountType",
            label: t("promoCodes.columns.discountType"),
            options: [
              { label: t("promoCodes.dialog.percentage"), value: "percentage" },
              { label: t("promoCodes.dialog.fixedAmount"), value: "fixed" },
            ],
          },
          {
            key: "isValid",
            label: t("promoCodes.filterValid"),
            options: [
              { label: t("promoCodes.filterValidYes"), value: "true" },
              { label: t("promoCodes.filterValidNo"), value: "false" },
            ],
          },
        ]}
        selectable
        rowActions={rowActions}
        rowActionsVariant="menu"
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("promoCodes.active"),
            value: activeCount,
            icon: Tag,
            variant: "primary",
          },
          {
            title: t("promoCodes.totalUsage"),
            value: totalUsage.toLocaleString(),
            icon: Hash,
            variant: "info",
          },
          {
            title: t("promoCodes.revenueImpact"),
            value: `-${revenueImpact.toLocaleString()}`,
            suffix: " KWD",
            icon: Wallet,
            variant: "warning",
          },
        ]}
        emptyState={{
          title: t("promoCodes.emptyState"),
          action: (
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
              {t("promoCodes.createFirst")}
            </Button>
          ),
        }}
      />

      <PromoCodeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promoCode={editingPromoCode}
        onSubmit={handleFormSubmit}
      />

      <PromoCodeDetailsModal
        open={viewingPromoCode !== null}
        onOpenChange={(open) => !open && setViewingPromoCode(null)}
        promoCode={viewingPromoCode}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={
          pendingAction?.type === "delete"
            ? t("promoCodes.confirmation.deleteTitle", { code: pendingAction.promoCode.code })
            : pendingAction?.type === "deleteSelected"
              ? t("promoCodes.confirmation.deleteSelectedTitle", {
                  count: pendingAction.promoCodes.length,
                })
              : ""
        }
        description={t("promoCodes.confirmation.delete")}
        confirmLabel={t("promoCodes.confirmation.yes")}
        cancelLabel={t("promoCodes.confirmation.no")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
