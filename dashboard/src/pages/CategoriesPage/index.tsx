import { useState, useEffect, useCallback } from "react";
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
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type AdminCategory,
} from "@/lib/adminApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { Department } from "@/data/products";

// ── Style maps ────────────────────────────────────────────────────────────────
const catStatusStyle: Record<"Active" | "Hidden", string> = {
  Active: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  Hidden: "text-muted-foreground bg-muted",
};

// ── Confirm dialog state ───────────────────────────────────────────────────────
type PendingAction =
  | { type: "delete"; category: AdminCategory }
  | { type: "deleteSelected"; categories: AdminCategory[] }
  | { type: "toggle"; category: AdminCategory }
  | null;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<AdminCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminCategories(1, 200);
      setCategoryList(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const activeCategories = categoryList.filter((c) => c.isActive).length;
  const topLevel = categoryList.filter((c) => !c.parentId).length;

  const parentOptions = categoryList
    .filter((c) => !c.parentId)
    .map((c) => ({ id: c.id, name: c.nameEn }));

  const categoryName = (id: string | null | undefined) =>
    categoryList.find((c) => c.id === id)?.nameEn ?? null;

  function openAddDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminCategory) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: CategoryFormValues, editingId: string | null) {
    const payload = {
      nameEn: values.nameEn,
      nameAr: values.nameAr,
      descriptionEn: values.descriptionEn,
      descriptionAr: values.descriptionAr,
      imageUrl: values.imageUrl,
      parentId: values.parentId || null,
      department: values.department,
      sortOrder: values.sortOrder,
    };

    try {
      if (editingId) {
        const updated = await updateAdminCategory(editingId, payload);
        setCategoryList((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast.success(t("categories.list.toasts.edited", { name: values.nameEn }));
      } else {
        const created = await createAdminCategory({ ...payload, isActive: true });
        setCategoryList((prev) => [...prev, created]);
        toast.success(t("categories.list.toasts.created", { name: values.nameEn }));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;

    try {
      if (pendingAction.type === "delete") {
        const { category } = pendingAction;
        await deleteAdminCategory(category.id);
        setCategoryList((prev) => prev.filter((c) => c.id !== category.id));
        toast.error(t("categories.list.toasts.deleted", { name: category.nameEn }));
      } else if (pendingAction.type === "deleteSelected") {
        await Promise.all(pendingAction.categories.map((c) => deleteAdminCategory(c.id)));
        const ids = new Set(pendingAction.categories.map((c) => c.id));
        setCategoryList((prev) => prev.filter((c) => !ids.has(c.id)));
        toast.error(
          t("categories.list.toasts.deletedSelected", { count: pendingAction.categories.length })
        );
      } else if (pendingAction.type === "toggle") {
        const { category } = pendingAction;
        const nextActive = !category.isActive;
        const updated = await updateAdminCategory(category.id, { isActive: nextActive });
        setCategoryList((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
        toast.success(
          t(nextActive ? "categories.list.toasts.unhidden" : "categories.list.toasts.hidden", {
            name: category.nameEn,
          })
        );
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const categoryColumns: ColumnDef<AdminCategory>[] = [
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
        const name = categoryName(v as string | null);
        return name ? (
          name
        ) : (
          <span className="text-muted-foreground">{t("categories.list.topLevel")}</span>
        );
      },
    },
    {
      key: "department",
      header: t("categories.list.columns.department"),
      sortable: true,
      render: (v) => t(`common.departments.${v as Department}`),
    },
    {
      key: "sortOrder",
      header: t("categories.list.columns.order"),
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
  ];

  const categoryRowActions: RowAction<AdminCategory>[] = [
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

  const categoryToolbarActions: ToolbarAction<AdminCategory>[] = [
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
      <DataTable<AdminCategory>
        title={t("categories.list.title")}
        description={t("categories.list.description")}
        data={categoryList}
        columns={categoryColumns}
        rowKey="id"
        loading={loading}
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
          {
            key: "department",
            label: t("categories.list.filterDepartment"),
            options: (["men", "women", "kids", "unisex"] as Department[]).map((d) => ({
              label: t(`common.departments.${d}`),
              value: d,
            })),
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
            value: categoryList.length.toLocaleString(),
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
