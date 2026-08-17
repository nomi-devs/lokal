import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Boxes,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import ProductFormDialog, { type ProductFormValues } from "./ProductFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { products as initialProducts, type Product, type ProductStatus } from "@/data/products";
import { initialVendors } from "@/data/vendors";
import { categories } from "@/data/categories";

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<ProductStatus, { text: string; bg: string; dot: string }> = {
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
  out_of_stock: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

const statusKey: Record<ProductStatus, string> = {
  active: "active",
  inactive: "inactive",
  out_of_stock: "outOfStock",
};

// ── Confirm dialog state ───────────────────────────────────────────────────────
type PendingAction =
  | { type: "delete"; product: Product }
  | { type: "deleteSelected"; products: Product[] }
  | null;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { t } = useTranslation();
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const activeProducts = productList.filter((p) => p.status === "active").length;
  const outOfStockProducts = productList.filter((p) => p.status === "out_of_stock").length;
  const totalStockUnits = productList.reduce((sum, p) => sum + p.stock, 0);

  const vendorName = (id: number) => initialVendors.find((v) => v.id === id)?.nameEn ?? null;
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.nameEn ?? null;

  function openAddDialog() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: ProductFormValues, editingId: number | null) {
    const vendorId = Number(values.vendorId);
    const categoryId = Number(values.categoryId);

    const sizes = values.sizes
      ? values.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const colors = values.colors
      ? values.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const images = values.image ? [values.image] : [];
    const now = new Date().toISOString();

    if (editingId != null) {
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                nameEn: values.nameEn,
                nameAr: values.nameAr,
                descriptionEn: values.descriptionEn ?? "",
                descriptionAr: values.descriptionAr ?? "",
                images: images.length ? images : p.images,
                vendorId,
                categoryId,
                price: values.price,
                sizes,
                colors,
                stock: values.stock,
                status: values.status,
                updatedAt: now,
              }
            : p
        )
      );
      toast.success(t("products.list.toasts.edited", { name: values.nameEn }));

      return;
    }

    const nextId = Math.max(0, ...productList.map((p) => p.id)) + 1;

    setProductList((prev) => [
      ...prev,
      {
        id: nextId,
        vendorId,
        categoryId,
        nameEn: values.nameEn,
        nameAr: values.nameAr,
        descriptionEn: values.descriptionEn ?? "",
        descriptionAr: values.descriptionAr ?? "",
        images,
        price: values.price,
        sizes,
        colors,
        stock: values.stock,
        status: values.status,
        ratings: { average: 0, count: 0 },
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(t("products.list.toasts.created", { name: values.nameEn }));
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      const { product } = pendingAction;

      setProductList((prev) => prev.filter((p) => p.id !== product.id));
      toast.error(t("products.list.toasts.deleted", { name: product.nameEn }));
    } else if (pendingAction.type === "deleteSelected") {
      const ids = new Set(pendingAction.products.map((p) => p.id));

      setProductList((prev) => prev.filter((p) => !ids.has(p.id)));
      toast.error(
        t("products.list.toasts.deletedSelected", { count: pendingAction.products.length })
      );
    }
  }

  const productColumns: ColumnDef<Product>[] = [
    {
      key: "nameEn",
      header: t("products.list.columns.product"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.images[0] ? (
            <img
              src={row.images[0]}
              alt={row.nameEn}
              className="w-10 h-10 rounded-md object-cover border shrink-0"
            />
          ) : (
            <span className="w-10 h-10 rounded-md border flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.nameEn}</p>
            <p className="text-xs text-muted-foreground truncate" dir="rtl">
              {row.nameAr}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "vendorId",
      header: t("products.list.columns.vendor"),
      sortable: true,
      render: (v) => vendorName(v as number) ?? "—",
    },
    {
      key: "categoryId",
      header: t("products.list.columns.category"),
      sortable: true,
      render: (v) => categoryName(v as number) ?? "—",
    },
    {
      key: "price",
      header: t("products.list.columns.price"),
      render: (_, row) => (
        <span className="font-medium text-sm">
          {row.price.base} {row.price.currency}
        </span>
      ),
    },
    {
      key: "stock",
      header: t("products.list.columns.stock"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-medium">{(v as number).toLocaleString()}</span>,
    },
    {
      key: "status",
      header: t("products.list.columns.status"),
      sortable: true,
      render: (v) => {
        const status = v as ProductStatus;
        const s = statusStyle[status];

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`products.list.status.${statusKey[status]}`)}
          </span>
        );
      },
    },
    {
      key: "ratings",
      header: t("products.list.columns.rating"),
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          {row.ratings.average.toFixed(1)}
          <span className="text-muted-foreground">({row.ratings.count})</span>
        </span>
      ),
    },
  ];

  const productRowActions: RowAction<Product>[] = [
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

  const productToolbarActions: ToolbarAction<Product>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => setPendingAction({ type: "deleteSelected", products: rows }),
    },
    {
      label: t("products.list.addProduct"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("products.topbarTitle")}>
      <DataTable<Product>
        title={t("products.list.title")}
        description={t("products.list.description")}
        data={productList}
        columns={productColumns}
        rowKey="id"
        searchable
        searchPlaceholder={t("products.list.searchPlaceholder")}
        searchKeys={["nameEn", "nameAr"]}
        filters={[
          {
            key: "status",
            label: t("products.list.filterStatus"),
            options: [
              { label: t("products.list.status.active"), value: "active" },
              { label: t("products.list.status.inactive"), value: "inactive" },
              { label: t("products.list.status.outOfStock"), value: "out_of_stock" },
            ],
          },
          {
            key: "categoryId",
            label: t("products.list.filterCategory"),
            options: categories.map((c) => ({ label: c.nameEn, value: String(c.id) })),
          },
        ]}
        selectable
        rowActions={productRowActions}
        rowActionsVariant="inline"
        toolbarActions={productToolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "updatedAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("products.list.stats.total"),
            value: productList.length,
            icon: Package,
            variant: "primary",
          },
          {
            title: t("products.list.stats.active"),
            value: activeProducts,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("products.list.stats.outOfStock"),
            value: outOfStockProducts,
            icon: XCircle,
            variant: "danger",
          },
          {
            title: t("products.list.stats.totalStockUnits"),
            value: totalStockUnits.toLocaleString(),
            icon: Boxes,
            variant: "warning",
          },
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

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={
          pendingAction?.type === "delete"
            ? t("products.list.confirm.deleteTitle")
            : pendingAction?.type === "deleteSelected"
              ? t("products.list.confirm.deleteSelectedTitle", {
                  count: pendingAction.products.length,
                })
              : ""
        }
        description={
          pendingAction?.type === "delete"
            ? t("products.list.confirm.deleteDescription", { name: pendingAction.product.nameEn })
            : pendingAction?.type === "deleteSelected"
              ? t("products.list.confirm.deleteSelectedDescription")
              : undefined
        }
        confirmLabel={t("common.actions.delete")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
