import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImagePlus,
  Eye,
  Pencil,
  Trash2,
  MousePointerClick,
  CalendarClock,
} from "lucide-react";

import BannerFormDialog, { type BannerFormValues } from "./BannerFormDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { banners as initialBanners, type Banner, type BannerPosition } from "@/data/banners";

// ── Derived display status (isActive + scheduling window) ─────────────────────
type DisplayStatus = "Active" | "Inactive" | "Scheduled";

function displayStatus(b: Banner): DisplayStatus {
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

const positionKey: Record<BannerPosition, string> = {
  "Home Top": "homeTop",
  "Home Middle": "homeMiddle",
  "Category Page": "categoryPage",
  Checkout: "checkout",
};

export default function BannersPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoading();
  const [bannerList, setBannerList] = useState<Banner[]>(initialBanners);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const active = bannerList.filter((b) => displayStatus(b) === "Active").length;
  const scheduled = bannerList.filter((b) => displayStatus(b) === "Scheduled").length;
  const totalClicks = bannerList.reduce((sum, b) => sum + b.clicks, 0);

  function openAddDialog() {
    setEditingBanner(null);
    setDialogOpen(true);
  }

  function openEditDialog(banner: Banner) {
    setEditingBanner(banner);
    setDialogOpen(true);
  }

  function handleFormSubmit(values: BannerFormValues, editingId: number | null) {
    const now = new Date().toISOString();

    if (editingId != null) {
      setBannerList((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...values, updatedAt: now } : b))
      );
      toast.success(t("banners.toasts.updated", { title: values.titleEn }));

      return;
    }

    const nextId = Math.max(0, ...bannerList.map((b) => b.id)) + 1;

    setBannerList((prev) => [
      ...prev,
      {
        ...values,
        id: nextId,
        type: "banner",
        isActive: true,
        clicks: 0,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(t("banners.toasts.created", { title: values.titleEn }));
  }

  const columns: ColumnDef<Banner>[] = [
    {
      key: "titleEn",
      header: t("banners.columns.banner"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={row.image}
            alt={row.titleEn}
            className="w-16 h-8 rounded-md object-cover border shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.titleEn}</p>
            <p className="text-xs text-muted-foreground truncate">{row.url}</p>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: t("banners.columns.position"),
      sortable: true,
      render: (v) => t(`banners.positions.${positionKey[v as BannerPosition]}`),
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
          {row.startDate ?? "—"} → {row.endDate ?? "—"}
        </span>
      ),
    },
    {
      key: "clicks",
      header: t("banners.columns.clicks"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-medium">{(v as number).toLocaleString()}</span>,
    },
    { key: "order", header: t("banners.columns.order"), sortable: true, align: "right" },
  ];

  const rowActions: RowAction<Banner>[] = [
    {
      label: t("common.actions.view"),
      icon: Eye,
      onClick: (r) => toast.info(r.url, { title: r.titleEn }),
    },
    { label: t("common.actions.edit"), icon: Pencil, onClick: openEditDialog },
    {
      label: t("common.actions.deactivate"),
      icon: Trash2,
      onClick: (r) => {
        setBannerList((prev) => prev.map((b) => (b.id === r.id ? { ...b, isActive: false } : b)));
        toast.success(t("banners.toasts.deactivated", { title: r.titleEn }));
      },
      hidden: (r) => displayStatus(r) !== "Active",
    },
    {
      label: t("common.actions.activate"),
      icon: Eye,
      onClick: (r) => {
        setBannerList((prev) => prev.map((b) => (b.id === r.id ? { ...b, isActive: true } : b)));
        toast.success(t("banners.toasts.activated", { title: r.titleEn }));
      },
      hidden: (r) => displayStatus(r) === "Active",
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      onClick: (r) => {
        setBannerList((prev) => prev.filter((b) => b.id !== r.id));
        toast.error(t("banners.toasts.deleted", { title: r.titleEn }));
      },
      variant: "destructive",
    },
  ];

  const toolbarActions: ToolbarAction<Banner>[] = [
    {
      label: t("common.actions.deleteSelected"),
      icon: Trash2,
      variant: "destructive",
      requiresSelection: true,
      onClick: (rows) => {
        const ids = new Set(rows.map((r) => r.id));

        setBannerList((prev) => prev.filter((b) => !ids.has(b.id)));
        toast.error(t("banners.toasts.deletedSelected", { count: rows.length }));
      },
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
      <DataTable<Banner>
        title={t("banners.title")}
        description={t("banners.description")}
        data={bannerList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("banners.searchPlaceholder")}
        searchKeys={["titleEn", "url"]}
        filters={[
          {
            key: "position",
            label: t("banners.filterPosition"),
            options: [
              { label: t("banners.positions.homeTop"), value: "Home Top" },
              { label: t("banners.positions.homeMiddle"), value: "Home Middle" },
              { label: t("banners.positions.categoryPage"), value: "Category Page" },
              { label: t("banners.positions.checkout"), value: "Checkout" },
            ],
          },
        ]}
        selectable
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "order", direction: "asc" }}
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
          {
            title: t("banners.stats.totalClicks"),
            value: totalClicks.toLocaleString(),
            icon: MousePointerClick,
            variant: "warning",
            trend: { value: 6.4, label: t("banners.stats.vsLastMonth") },
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
    </DashboardLayout>
  );
}
