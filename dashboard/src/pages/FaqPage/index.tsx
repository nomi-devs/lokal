import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Plus, Pencil, Trash2, Eye, Power } from "lucide-react";

import FaqFormDialog, { type FaqFormValues } from "./FaqFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useListData } from "@/hooks/useListData";
import {
  listAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  type AdminFaq,
} from "@/lib/adminApi";
import { getApiErrorMessage } from "@/lib/apiClient";

const statusStyle: Record<"Active" | "Hidden", string> = {
  Active: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  Hidden: "text-muted-foreground bg-muted",
};

type PendingAction =
  | { type: "delete"; faq: AdminFaq }
  | { type: "deleteSelected"; faqs: AdminFaq[] }
  | { type: "toggle"; faq: AdminFaq }
  | null;

export default function FaqPage() {
  const { t } = useTranslation();

  const {
    data: faqList,
    setData: setFaqList,
    loading,
  } = useListData(async () => (await listAdminFaqs(1, 200)).data, [] as AdminFaq[], {
    fallbackMessage: t("faqs.list.loadFailed"),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<AdminFaq | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const activeCount = faqList.filter((f) => f.isActive).length;

  function openAddDialog() {
    setEditingFaq(null);
    setDialogOpen(true);
  }

  function openEditDialog(faq: AdminFaq) {
    setEditingFaq(faq);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: FaqFormValues, editingId: string | null) {
    try {
      if (editingId) {
        const updated = await updateAdminFaq(editingId, values);
        setFaqList((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
        toast.success(t("faqs.list.toasts.edited"));
      } else {
        const created = await createAdminFaq({ ...values, isActive: true });
        setFaqList((prev) => [...prev, created]);
        toast.success(t("faqs.list.toasts.created"));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    try {
      if (pendingAction.type === "delete") {
        await deleteAdminFaq(pendingAction.faq.id);
        setFaqList((prev) => prev.filter((f) => f.id !== pendingAction.faq.id));
        toast.error(t("faqs.list.toasts.deleted"));
      } else if (pendingAction.type === "deleteSelected") {
        await Promise.all(pendingAction.faqs.map((f) => deleteAdminFaq(f.id)));
        const ids = new Set(pendingAction.faqs.map((f) => f.id));
        setFaqList((prev) => prev.filter((f) => !ids.has(f.id)));
        toast.error(t("faqs.list.toasts.deletedSelected", { count: pendingAction.faqs.length }));
      } else if (pendingAction.type === "toggle") {
        const { faq } = pendingAction;
        const updated = await updateAdminFaq(faq.id, { isActive: !faq.isActive });
        setFaqList((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
        toast.success(
          !faq.isActive ? t("faqs.list.toasts.unhidden") : t("faqs.list.toasts.hidden")
        );
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const columns: ColumnDef<AdminFaq>[] = [
    {
      key: "questionEn",
      header: t("faqs.list.columns.question"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.questionEn}</p>
          <p className="text-xs text-muted-foreground truncate" dir="rtl">
            {row.questionAr}
          </p>
        </div>
      ),
    },
    {
      key: "answerEn",
      header: t("faqs.list.columns.answer"),
      render: (_, row) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{row.answerEn}</p>
      ),
    },
    {
      key: "sortOrder",
      header: t("faqs.list.columns.order"),
      sortable: true,
      align: "right",
    },
    {
      key: "isActive",
      header: t("faqs.list.columns.status"),
      sortable: true,
      render: (v) => {
        const label = v ? "Active" : "Hidden";

        return (
          <span
            className={cn(
              "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
              statusStyle[label]
            )}
          >
            {t(`common.status.${label.toLowerCase()}`, label)}
          </span>
        );
      },
    },
  ];

  const rowActions: RowAction<AdminFaq>[] = [
    { label: t("common.actions.edit"), icon: Pencil, onClick: openEditDialog },
    {
      label: t("common.actions.hide"),
      icon: Power,
      variant: "warning",
      onClick: (r) => setPendingAction({ type: "toggle", faq: r }),
      hidden: (r) => !r.isActive,
    },
    {
      label: t("common.actions.unhide"),
      icon: Power,
      variant: "warning",
      onClick: (r) => setPendingAction({ type: "toggle", faq: r }),
      hidden: (r) => r.isActive,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      variant: "destructive",
      onClick: (r) => setPendingAction({ type: "delete", faq: r }),
    },
  ];

  const toolbarActions: ToolbarAction<AdminFaq>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => setPendingAction({ type: "deleteSelected", faqs: rows }),
    },
    {
      label: t("faqs.list.addFaq"),
      icon: Plus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("faqs.topbarTitle")}>
      <DataTable<AdminFaq>
        title={t("faqs.list.title")}
        description={t("faqs.list.description")}
        data={faqList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("faqs.list.searchPlaceholder")}
        searchKeys={["questionEn", "questionAr"]}
        filters={[
          {
            key: "isActive",
            label: t("faqs.list.filterStatus"),
            options: [
              { label: t("common.status.active"), value: "true" },
              { label: t("common.status.hidden"), value: "false" },
            ],
          },
        ]}
        selectable
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 25] }}
        defaultSort={{ key: "sortOrder", direction: "asc" }}
        striped
        stats={[
          {
            title: t("faqs.list.stats.total"),
            value: faqList.length,
            icon: HelpCircle,
            variant: "primary",
          },
          { title: t("faqs.list.stats.active"), value: activeCount, icon: Eye, variant: "success" },
        ]}
        emptyState={{
          title: t("faqs.list.emptyTitle"),
          description: t("faqs.list.emptyDescription"),
        }}
      />

      <FaqFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={editingFaq}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant={pendingAction?.type === "toggle" ? "default" : "destructive"}
        title={
          pendingAction?.type === "delete"
            ? t("faqs.list.confirm.deleteTitle")
            : pendingAction?.type === "deleteSelected"
              ? t("faqs.list.confirm.deleteSelectedTitle", { count: pendingAction.faqs.length })
              : pendingAction?.type === "toggle"
                ? pendingAction.faq.isActive
                  ? t("faqs.list.confirm.hideTitle")
                  : t("faqs.list.confirm.unhideTitle")
                : ""
        }
        description={
          pendingAction?.type === "delete"
            ? t("faqs.list.confirm.deleteDescription", { question: pendingAction.faq.questionEn })
            : pendingAction?.type === "deleteSelected"
              ? t("faqs.list.confirm.deleteSelectedDescription")
              : pendingAction?.type === "toggle"
                ? pendingAction.faq.isActive
                  ? t("faqs.list.confirm.hideDescription")
                  : t("faqs.list.confirm.unhideDescription")
                : undefined
        }
        confirmLabel={
          pendingAction?.type === "delete" || pendingAction?.type === "deleteSelected"
            ? t("common.actions.delete")
            : pendingAction?.type === "toggle"
              ? pendingAction.faq.isActive
                ? t("common.actions.hide")
                : t("common.actions.unhide")
              : undefined
        }
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
