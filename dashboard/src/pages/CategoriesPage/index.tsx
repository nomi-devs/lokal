import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderTree, Plus, Pencil, Trash2, Eye, Power, Layers, FileText } from "lucide-react";

import CategoryFormDialog, { type CategoryFormValues } from "./CategoryFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { categories as initialCategories, type Category } from "@/data/categories";

// ── Style maps ────────────────────────────────────────────────────────────────
const catStatusStyle: Record<"Active" | "Hidden", string> = {
  Active: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  Hidden: "text-muted-foreground bg-muted",
};

// ── Confirm dialog state ───────────────────────────────────────────────────────
type PendingAction =
  | { type: "delete"; category: Category }
  | { type: "deleteSelected"; categories: Category[] }
  | { type: "toggle"; category: Category }
  | null;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categoryList, setCategoryList] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const activeCategories = categoryList.filter((c) => c.isActive).length;
  const topLevel = categoryList.filter((c) => c.parentId === null).length;

  const parentOptions = categoryList
    .filter((c) => c.parentId === null)
    .map((c) => ({ id: c.id, name: c.nameEn }));
  const categoryName = (id: number | null) => categoryList.find((c) => c.id === id)?.nameEn ?? null;

  function openAddDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: CategoryFormValues, editingId: number | null) {
    const parentId = values.parentId ? Number(values.parentId) : null;
    const now = new Date().toISOString();

    if (editingId != null) {
      setCategoryList((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...values, parentId, updatedAt: now } : c))
      );
      toast.success(t("categories.list.toasts.edited", { name: values.nameEn }));

      return;
    }

    const nextId = Math.max(0, ...categoryList.map((c) => c.id)) + 1;

    setCategoryList((prev) => [
      ...prev,
      {
        ...values,
        parentId,
        id: nextId,
        itemsCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(t("categories.list.toasts.created", { name: values.nameEn }));
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      const { category } = pendingAction;

      setCategoryList((prev) => prev.filter((c) => c.id !== category.id));
      toast.error(t("categories.list.toasts.deleted", { name: category.nameEn }));
    } else if (pendingAction.type === "deleteSelected") {
      const ids = new Set(pendingAction.categories.map((c) => c.id));

      setCategoryList((prev) => prev.filter((c) => !ids.has(c.id)));
      toast.error(
        t("categories.list.toasts.deletedSelected", { count: pendingAction.categories.length })
      );
    } else if (pendingAction.type === "toggle") {
      const { category } = pendingAction;
      const nextActive = !category.isActive;

      setCategoryList((prev) =>
        prev.map((c) =>
          c.id === category.id
            ? { ...c, isActive: nextActive, updatedAt: new Date().toISOString() }
            : c
        )
      );
      toast.success(
        t(nextActive ? "categories.list.toasts.unhidden" : "categories.list.toasts.hidden", {
          name: category.nameEn,
        })
      );
    }
  }

  const categoryColumns: ColumnDef<Category>[] = [
    {
      key: "nameEn",
      header: t("categories.list.columns.category"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.nameEn}</p>
          <p className="text-xs text-muted-foreground truncate" dir="rtl">
            {row.nameAr}
          </p>
        </div>
      ),
    },
    {
      key: "parentId",
      header: t("categories.list.columns.parent"),
      sortable: true,
      render: (v) => {
        const name = categoryName(v as number | null);

        return name ? (
          name
        ) : (
          <span className="text-muted-foreground">{t("categories.list.topLevel")}</span>
        );
      },
    },
    {
      key: "itemsCount",
      header: t("categories.list.columns.listings"),
      sortable: true,
      align: "right",
    },
    {
      key: "isActive",
      header: t("categories.list.columns.status"),
      sortable: true,
      render: (v) => {
        const label = v ? "Active" : "Hidden";

        return (
          <span
            className={cn(
              "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
              catStatusStyle[label]
            )}
          >
            {t(`common.status.${label.toLowerCase()}`, label)}
          </span>
        );
      },
    },
    {
      key: "sortOrder",
      header: t("categories.list.columns.order"),
      sortable: true,
      align: "right",
    },
  ];

  const categoryRowActions: RowAction<Category>[] = [
    {
      label: t("common.actions.edit"),
      icon: Pencil,
      onClick: openEditDialog,
    },
    {
      label: t("common.actions.hide"),
      icon: Power,
      variant: "warning",
      onClick: (r) => setPendingAction({ type: "toggle", category: r }),
      hidden: (r) => !r.isActive,
    },
    {
      label: t("common.actions.unhide"),
      icon: Power,
      variant: "warning",
      onClick: (r) => setPendingAction({ type: "toggle", category: r }),
      hidden: (r) => r.isActive,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", category: r }),
    },
  ];

  const categoryToolbarActions: ToolbarAction<Category>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => setPendingAction({ type: "deleteSelected", categories: rows }),
    },
    {
      label: t("categories.list.addCategory"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("categories.topbarTitle")}>
      <DataTable<Category>
        title={t("categories.list.title")}
        description={t("categories.list.description")}
        data={categoryList}
        columns={categoryColumns}
        rowKey="id"
        searchable
        searchPlaceholder={t("categories.list.searchPlaceholder")}
        searchKeys={["nameEn", "nameAr"]}
        filters={[
          {
            key: "isActive",
            label: t("categories.list.filterStatus"),
            options: [
              { label: t("common.status.active"), value: "true" },
              { label: t("common.status.hidden"), value: "false" },
            ],
          },
        ]}
        selectable
        rowActions={categoryRowActions}
        rowActionsVariant="inline"
        toolbarActions={categoryToolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "sortOrder", direction: "asc" }}
        striped
        stats={[
          {
            title: t("categories.list.stats.total"),
            value: categoryList.length,
            icon: FolderTree,
            variant: "primary",
          },
          {
            title: t("categories.list.stats.topLevel"),
            value: topLevel,
            icon: Layers,
            variant: "info",
          },
          {
            title: t("categories.list.stats.active"),
            value: activeCategories,
            icon: Eye,
            variant: "success",
          },
          {
            title: t("categories.list.stats.totalListings"),
            value: categoryList.reduce((sum, c) => sum + c.itemsCount, 0).toLocaleString(),
            icon: FileText,
            variant: "warning",
          },
        ]}
        emptyState={{
          title: t("categories.list.emptyTitle"),
          description: t("categories.list.emptyDescription"),
        }}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentOptions={parentOptions.filter((p) => p.id !== editingCategory?.id)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant={pendingAction?.type === "toggle" ? "default" : "destructive"}
        title={
          pendingAction?.type === "delete"
            ? t("categories.list.confirm.deleteTitle")
            : pendingAction?.type === "deleteSelected"
              ? t("categories.list.confirm.deleteSelectedTitle", {
                  count: pendingAction.categories.length,
                })
              : pendingAction?.type === "toggle"
                ? pendingAction.category.isActive
                  ? t("categories.list.confirm.hideTitle")
                  : t("categories.list.confirm.unhideTitle")
                : ""
        }
        description={
          pendingAction?.type === "delete"
            ? t("categories.list.confirm.deleteDescription", {
                name: pendingAction.category.nameEn,
              })
            : pendingAction?.type === "deleteSelected"
              ? t("categories.list.confirm.deleteSelectedDescription")
              : pendingAction?.type === "toggle"
                ? pendingAction.category.isActive
                  ? t("categories.list.confirm.hideDescription", {
                      name: pendingAction.category.nameEn,
                    })
                  : t("categories.list.confirm.unhideDescription", {
                      name: pendingAction.category.nameEn,
                    })
                : undefined
        }
        confirmLabel={
          pendingAction?.type === "delete"
            ? t("common.actions.delete")
            : pendingAction?.type === "deleteSelected"
              ? t("common.actions.deleteSelected")
              : pendingAction?.type === "toggle"
                ? pendingAction.category.isActive
                  ? t("common.actions.hide")
                  : t("common.actions.unhide")
                : undefined
        }
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
