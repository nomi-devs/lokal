import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import VendorProductFormDialog from "./VendorProductFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as productsApi from "@/lib/productsApi";
import type { Product, ProductPayload } from "@/lib/productsApi";
import { useListData } from "@/hooks/useListData";

const statusStyle: Record<string, { text: string; bg: string; dot: string }> = {
  active: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  inactive: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    dot: "bg-slate-400",
  },
  rejected: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

type PendingAction = { type: "delete"; product: Product } | null;

export default function VendorProducts() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const {
    data: productList,
    loading,
    refetch: load,
  } = useListData(
    async () => {
      const { data } = await productsApi.listMyProducts();

      // DataTable's search does String(row[key]).includes(...) — name is a
      // { en, ar? } object, so give it a flat string field to search against.
      return data.map((p) => ({ ...p, searchName: `${p.name.en} ${p.name.ar ?? ""}` }));
    },
    [] as Product[],
    { fallbackMessage: t("vendor.products.list.toasts.loadFailed") }
  );

  const activeCount = productList.filter((p) => p.status === "active").length;
  const inactiveCount = productList.filter((p) => p.status === "inactive").length;
  const rejectedCount = productList.filter((p) => p.status === "rejected").length;

  function openAddDialog() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  async function handleFormSubmit(payload: ProductPayload, editingId: string | null) {
    try {
      if (editingId) {
        await productsApi.updateMyProduct(editingId, payload);
        toast.success(t("vendor.products.list.toasts.edited", { name: payload.name.en }));
      } else {
        await productsApi.createMyProduct(payload);
        toast.success(t("vendor.products.list.toasts.created", { name: payload.name.en }));
      }

      setDialogOpen(false);
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendor.products.list.toasts.actionFailed")));
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    try {
      await productsApi.deleteMyProduct(pendingAction.product.id);
      toast.success(
        t("vendor.products.list.toasts.deleted", { name: pendingAction.product.name.en })
      );
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendor.products.list.toasts.actionFailed")));
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      key: "name",
      header: t("vendor.products.list.columns.product"),
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.images[0] ? (
            <img
              src={row.images[0]}
              alt={row.name.en}
              className="w-10 h-10 rounded-md object-cover border shrink-0"
            />
          ) : (
            <span className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.name.en}</p>
            {row.name.ar && (
              <p className="text-xs text-muted-foreground truncate" dir="rtl">
                {row.name.ar}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "gender",
      header: t("vendor.products.list.columns.gender"),
      render: (v) => t(`common.genders.${v as string}`),
    },
    {
      key: "price",
      header: t("vendor.products.list.columns.price"),
      render: (_, row) => {
        const hasDiscount = row.compareAtPrice != null && row.compareAtPrice > row.price;

        const discountPct = hasDiscount
          ? Math.round((1 - row.price / row.compareAtPrice!) * 100)
          : 0;

        return (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{row.price}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {row.compareAtPrice}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "stock",
      header: t("vendor.products.list.columns.stock"),
      align: "right",
      render: (v) => <span className="font-medium">{(v as number).toLocaleString()}</span>,
    },
    {
      key: "status",
      header: t("vendor.products.list.columns.status"),
      render: (v, row) => {
        const status = v as string;
        const s = statusStyle[status];

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
            title={status === "rejected" ? row.rejectionReason : undefined}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`vendor.products.list.status.${status}`)}
          </span>
        );
      },
    },
    {
      key: "rating",
      header: t("vendor.products.list.columns.rating"),
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          {row.rating.toFixed(1)}
          <span className="text-muted-foreground">({row.ratingCount})</span>
        </span>
      ),
    },
  ];

  const rowActions: RowAction<Product>[] = [
    { label: t("common.actions.edit"), icon: Pencil, onClick: openEditDialog },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", product: r }),
    },
  ];

  const toolbarActions: ToolbarAction<Product>[] = [
    {
      label: t("vendor.products.list.addProduct"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.products.topbarTitle")}
    >
      <DataTable<Product>
        title={t("vendor.products.list.title")}
        description={t("vendor.products.list.description")}
        data={productList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("vendor.products.list.searchPlaceholder")}
        searchKeys={["searchName"]}
        filters={[
          {
            key: "status",
            label: t("vendor.products.list.filterStatus"),
            options: [
              { label: t("vendor.products.list.status.active"), value: "active" },
              { label: t("vendor.products.list.status.inactive"), value: "inactive" },
              { label: t("vendor.products.list.status.rejected"), value: "rejected" },
            ],
          },
          {
            key: "gender",
            label: t("vendor.products.list.filterGender"),
            options: (["male", "female", "kids", "unisex"] as const).map((g) => ({
              label: t(`common.genders.${g}`),
              value: g,
            })),
          },
        ]}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("vendor.products.list.stats.total"),
            value: productList.length,
            icon: Package,
            variant: "primary",
          },
          {
            title: t("vendor.products.list.stats.active"),
            value: activeCount,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("vendor.products.list.stats.inactive"),
            value: inactiveCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("vendor.products.list.stats.rejected"),
            value: rejectedCount,
            icon: XCircle,
            variant: "danger",
          },
        ]}
        emptyState={{
          title: t("vendor.products.list.emptyTitle"),
          description: t("vendor.products.list.emptyDescription"),
        }}
      />

      <VendorProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={t("vendor.products.list.confirm.deleteTitle")}
        description={
          pendingAction
            ? t("vendor.products.list.confirm.deleteDescription", {
                name: pendingAction.product.name.en,
              })
            : undefined
        }
        confirmLabel={t("common.actions.delete")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
