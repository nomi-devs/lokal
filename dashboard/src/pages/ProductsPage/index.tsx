import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Pencil, Trash2, CheckCircle2, XCircle, RotateCcw, Star, Image as ImageIcon } from "lucide-react";

import ProductFormDialog from "./ProductFormDialog";
import ProductRejectDialog from "./ProductRejectDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as productsApi from "@/lib/productsApi";
import type { Product } from "@/lib/productsApi";
import * as adminApi from "@/lib/adminApi";
import type { AdminVendorRow } from "@/lib/adminApi";

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

export default function ProductsPage() {
  const { t } = useTranslation();
  const [productList, setProductList] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function load() {
    setLoading(true);
    try {
      const [productsResp, vendorsResp] = await Promise.all([
        productsApi.listAdminProducts(),
        adminApi.listVendors(),
      ]);

      // DataTable's search does String(row[key]).includes(...) — name is a
      // { en, ar? } object, so give it a flat string field to search against.
      setProductList(productsResp.data.map((p) => ({ ...p, searchName: `${p.name.en} ${p.name.ar ?? ""}` })));
      setVendors(vendorsResp.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("products.list.toasts.loadFailed")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.storeName ?? null;

  const activeCount = productList.filter((p) => p.status === "active").length;
  const inactiveCount = productList.filter((p) => p.status === "inactive").length;
  const rejectedCount = productList.filter((p) => p.status === "rejected").length;

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  async function handleFormSubmit(payload: productsApi.ProductPayload) {
    if (!editingProduct) {
      return;
    }

    try {
      await productsApi.updateAdminProduct(editingProduct.id, payload);
      toast.success(t("products.list.toasts.updated", { name: payload.name.en }));
      setDialogOpen(false);
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("products.list.toasts.actionFailed")));
    }
  }

  async function handleReinstate(product: Product) {
    try {
      await productsApi.updateAdminProduct(product.id, { status: "active" });
      toast.success(t("products.list.toasts.reinstated", { name: product.name.en }));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("products.list.toasts.actionFailed")));
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) {
      return;
    }

    try {
      await productsApi.updateAdminProduct(rejectTarget.id, { status: "rejected", rejectionReason: reason });
      toast.success(t("products.list.toasts.rejected", { name: rejectTarget.name.en }));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("products.list.toasts.actionFailed")));
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    try {
      await productsApi.deleteAdminProduct(pendingAction.product.id);
      toast.success(t("products.list.toasts.deleted", { name: pendingAction.product.name.en }));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("products.list.toasts.actionFailed")));
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      key: "name",
      header: t("products.list.columns.product"),
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
      key: "vendorId",
      header: t("products.list.columns.vendor"),
      render: (v) => vendorName(v as string) ?? "—",
    },
    {
      key: "gender",
      header: t("products.list.columns.gender"),
      render: (v) => t(`common.genders.${v as string}`),
    },
    {
      key: "price",
      header: t("products.list.columns.price"),
      render: (_, row) => {
        const hasDiscount = row.compareAtPrice != null && row.compareAtPrice > row.price;
        const discountPct = hasDiscount ? Math.round((1 - row.price / row.compareAtPrice!) * 100) : 0;

        return (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{row.price}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-muted-foreground line-through">{row.compareAtPrice}</span>
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
      header: t("products.list.columns.stock"),
      align: "right",
      render: (v, row) => (
        <div className="flex flex-col items-end">
          <span className="font-medium">{(v as number).toLocaleString()}</span>
          {!row.inStock && <span className="text-xs text-muted-foreground">{t("products.list.status.inactive")}</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: t("products.list.columns.status"),
      render: (v) => {
        const status = v as string;
        const s = statusStyle[status];

        return (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full", s.text, s.bg)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`products.list.status.${status}`)}
          </span>
        );
      },
    },
    {
      key: "rating",
      header: t("products.list.columns.rating"),
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
    {
      label: t("common.actions.reject"),
      icon: XCircle,
      variant: "destructive",
      hidden: (row) => row.status === "rejected",
      onClick: (row) => setRejectTarget(row),
    },
    {
      label: t("common.actions.reinstate"),
      icon: CheckCircle2,
      hidden: (row) => row.status !== "rejected",
      onClick: handleReinstate,
    },
    {
      label: t("common.actions.edit"),
      icon: Pencil,
      onClick: openEditDialog,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", product: r }),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("products.topbarTitle")}>
      <DataTable<Product>
        title={t("products.list.title")}
        description={t("products.list.description")}
        data={productList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("products.list.searchPlaceholder")}
        searchKeys={["searchName"]}
        filters={[
          {
            key: "status",
            label: t("products.list.filterStatus"),
            options: [
              { label: t("products.list.status.active"), value: "active" },
              { label: t("products.list.status.inactive"), value: "inactive" },
              { label: t("products.list.status.rejected"), value: "rejected" },
            ],
          },
          {
            key: "gender",
            label: t("products.list.filterGender"),
            options: (["male", "female", "kids", "unisex"] as const).map((g) => ({
              label: t(`common.genders.${g}`),
              value: g,
            })),
          },
        ]}
        rowActions={rowActions}
        rowActionsVariant="inline"
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          { title: t("products.list.stats.total"), value: productList.length, icon: Package, variant: "primary" },
          { title: t("products.list.stats.active"), value: activeCount, icon: CheckCircle2, variant: "success" },
          { title: t("products.list.stats.inactive"), value: inactiveCount, icon: RotateCcw, variant: "warning" },
          { title: t("products.list.stats.rejected"), value: rejectedCount, icon: XCircle, variant: "danger" },
        ]}
        emptyState={{
          title: t("products.list.emptyTitle"),
          description: t("products.list.emptyDescription"),
        }}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
      />

      <ProductRejectDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        product={rejectTarget}
        onReject={handleReject}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={t("products.list.confirm.deleteTitle")}
        description={
          pendingAction ? t("products.list.confirm.deleteDescription", { name: pendingAction.product.name.en }) : undefined
        }
        confirmLabel={t("common.actions.delete")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
