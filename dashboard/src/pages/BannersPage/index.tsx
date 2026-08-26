import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ImagePlus, Eye, Pencil, Trash2, CalendarClock } from "lucide-react";

import BannerFormDialog, { type BannerFormValues } from "./BannerFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  listAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  type AdminBanner,
} from "@/lib/bannersApi";
import { getApiErrorMessage } from "@/lib/apiClient";

// ── Derived display status (isActive + scheduling window) ─────────────────────
type DisplayStatus = "Active" | "Inactive" | "Scheduled";

function displayStatus(b: AdminBanner): DisplayStatus {
  if (!b.isActive) {
    return "Inactive";
  }

  if (b.startDate && new Date(b.startDate) > new Date()) {
    return "Scheduled";
  }

  return "Active";
}

const statusStyle: Record<DisplayStatus, { text: string; bg: string; dot: string }> = {
  Active: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  Inactive: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    dot: "bg-slate-400",
  },
  Scheduled: {
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    dot: "bg-sky-500",
  },
};

type PendingAction =
  | { type: "delete"; banner: AdminBanner }
  | { type: "deleteSelected"; banners: AdminBanner[] }
  | null;

export default function BannersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [bannerList, setBannerList] = useState<AdminBanner[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminBanners();
      setBannerList(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load banners"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const active = bannerList.filter((b) => displayStatus(b) === "Active").length;
  const scheduled = bannerList.filter((b) => displayStatus(b) === "Scheduled").length;

  function openAddDialog() {
    setEditingBanner(null);
    setDialogOpen(true);
  }

  function openEditDialog(banner: AdminBanner) {
    setEditingBanner(banner);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: BannerFormValues, editingId: string | null) {
    const payload = {
      imageUrl: values.image,
      titleEn: values.titleEn || undefined,
      titleAr: values.titleAr || undefined,
      linkUrl: values.url,
      sortOrder: values.order,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    };

    try {
      if (editingId) {
        const updated = await updateAdminBanner(editingId, payload);
        setBannerList((prev) => prev.map((b) => (b.id === editingId ? updated : b)));
        toast.success(t("banners.toasts.updated", { title: values.titleEn }));
      } else {
        const created = await createAdminBanner({ ...payload, isActive: true });
        setBannerList((prev) => [...prev, created]);
        toast.success(t("banners.toasts.created", { title: values.titleEn }));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function toggleActive(banner: AdminBanner) {
    try {
      const updated = await updateAdminBanner(banner.id, { isActive: !banner.isActive });
      setBannerList((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      toast.success(
        t(updated.isActive ? "banners.toasts.activated" : "banners.toasts.deactivated", {
          title: banner.titleEn,
        })
      );
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
        const { banner } = pendingAction;

        await deleteAdminBanner(banner.id);
        setBannerList((prev) => prev.filter((b) => b.id !== banner.id));
        toast.error(t("banners.toasts.deleted", { title: banner.titleEn }));
      } else {
        const { banners } = pendingAction;

        await Promise.all(banners.map((b) => deleteAdminBanner(b.id)));
        const ids = new Set(banners.map((b) => b.id));
        setBannerList((prev) => prev.filter((b) => !ids.has(b.id)));
        toast.error(t("banners.toasts.deletedSelected", { count: banners.length }));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const columns: ColumnDef<AdminBanner>[] = [
    {
      key: "titleEn",
      header: t("banners.columns.banner"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={row.imageUrl}
            alt={row.titleEn}
            className="w-16 h-8 rounded-md object-cover border shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.titleEn}</p>
            <p className="text-xs text-muted-foreground truncate">{row.linkUrl}</p>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      header: t("banners.columns.status"),
      sortable: true,
      render: (_, row) => {
        const status = displayStatus(row);
        const s = statusStyle[status];

        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {t(`common.status.${status.toLowerCase()}`, status)}
          </span>
        );
      },
    },
    {
      key: "startDate",
      header: t("banners.columns.activeWindow"),
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          {row.startDate ? new Date(row.startDate).toLocaleDateString() : "—"} →{" "}
          {row.endDate ? new Date(row.endDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
    { key: "sortOrder", header: t("banners.columns.order"), sortable: true, align: "right" },
  ];

  const rowActions: RowAction<AdminBanner>[] = [
    {
      label: t("common.actions.view"),
      icon: Eye,
      onClick: (r) => toast.info(r.linkUrl ?? "—", { title: r.titleEn }),
    },
    { label: t("common.actions.edit"), icon: Pencil, onClick: openEditDialog },
    {
      label: t("common.actions.deactivate"),
      icon: Trash2,
      onClick: toggleActive,
      hidden: (r) => displayStatus(r) !== "Active",
    },
    {
      label: t("common.actions.activate"),
      icon: Eye,
      onClick: toggleActive,
      hidden: (r) => displayStatus(r) === "Active",
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      onClick: (r) => setPendingAction({ type: "delete", banner: r }),
      variant: "destructive",
    },
  ];

  const toolbarActions: ToolbarAction<AdminBanner>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => setPendingAction({ type: "deleteSelected", banners: rows }),
    },
    {
      label: t("banners.addBanner"),
      icon: ImagePlus,
      variant: "default",
      requiresSelection: false,
      onClick: openAddDialog,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("banners.topbarTitle")}>
      <DataTable<AdminBanner>
        title={t("banners.title")}
        description={t("banners.description")}
        data={bannerList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("banners.searchPlaceholder")}
        searchKeys={["titleEn", "linkUrl"]}
        selectable
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "sortOrder", direction: "asc" }}
        striped
        stats={[
          {
            title: t("banners.stats.total"),
            value: bannerList.length,
            icon: Image,
            variant: "primary",
          },
          { title: t("banners.stats.active"), value: active, icon: Eye, variant: "success" },
          {
            title: t("banners.stats.scheduled"),
            value: scheduled,
            icon: CalendarClock,
            variant: "info",
          },
        ]}
        emptyState={{
          title: t("banners.emptyTitle"),
          description: t("banners.emptyDescription"),
        }}
      />

      <BannerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editingBanner}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        variant="destructive"
        title={
          pendingAction?.type === "deleteSelected"
            ? t("banners.confirm.deleteSelectedTitle", { count: pendingAction.banners.length })
            : t("banners.confirm.deleteTitle")
        }
        description={
          pendingAction?.type === "delete"
            ? t("banners.confirm.deleteDescription", { title: pendingAction.banner.titleEn })
            : pendingAction?.type === "deleteSelected"
              ? t("banners.confirm.deleteSelectedDescription")
              : undefined
        }
        confirmLabel={t("common.actions.delete")}
        onConfirm={confirmPendingAction}
      />
    </DashboardLayout>
  );
}
