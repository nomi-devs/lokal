import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, CheckCircle2, XCircle, Store, Eye } from "lucide-react";

import KycDetailsDialog from "./KycDetailsDialog";
import KycApproveDialog from "./KycApproveDialog";
import KycRejectDialog from "./KycRejectDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { initialVendors, type Vendor, type KycStatus } from "@/data/vendors";

const kycStatusStyle: Record<KycStatus, { text: string; bg: string; dot: string }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  approved: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  rejected: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

type KycRow = {
  id: number;
  nameEn: string;
  nameAr: string;
  ownerName: string;
  category: string;
  kycStatus: KycStatus;
  submittedAt: string;
  vendor: Vendor;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function KycVerificationPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);

  const [viewTarget, setViewTarget] = useState<Vendor | null>(null);
  const [approveTarget, setApproveTarget] = useState<Vendor | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null);

  function approve(vendorId: number, notes: string, reviewedBy: string) {
    const now = todayIso();

    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              kyc: {
                ...v.kyc,
                status: "approved",
                approvedBy: reviewedBy,
                approvalNotes: notes || undefined,
                approvedAt: now,
                rejectedAt: undefined,
                documents: v.kyc.documents.map((d) => ({
                  ...d,
                  verifiedAt: d.verifiedAt ?? now,
                })),
              },
            }
          : v
      )
    );

    const vendor = vendors.find((v) => v.id === vendorId);
    toast.success(t("kyc.toasts.approvedBody", { name: vendor?.nameEn }), {
      title: t("kyc.toasts.approvedTitle"),
    });
  }

  function reject(vendorId: number, reason: string) {
    const now = todayIso();

    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              kyc: {
                ...v.kyc,
                status: "rejected",
                approvedBy: undefined,
                approvalNotes: reason,
                rejectedAt: now,
              },
            }
          : v
      )
    );

    const vendor = vendors.find((v) => v.id === vendorId);
    toast.error(t("kyc.toasts.rejectedBody", { name: vendor?.nameEn }), {
      title: t("kyc.toasts.rejectedTitle"),
    });
  }

  const rows: KycRow[] = useMemo(
    () =>
      vendors.map((v) => ({
        id: v.id,
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        ownerName: v.ownerName,
        category: v.category,
        kycStatus: v.kyc.status,
        submittedAt: v.kyc.submittedAt,
        vendor: v,
      })),
    [vendors]
  );

  const pendingCount = vendors.filter((v) => v.kyc.status === "pending").length;

  const approvedTodayCount = vendors.filter(
    (v) => v.kyc.status === "approved" && v.kyc.approvedAt === todayIso()
  ).length;

  const columns: ColumnDef<KycRow>[] = [
    {
      key: "nameEn",
      header: t("kyc.table.columns.vendor"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
              avatarColor(row.nameEn)
            )}
          >
            {row.nameEn
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.nameEn}</p>
            <p className="text-xs text-muted-foreground truncate" dir="rtl">
              {row.nameAr}
            </p>
          </div>
        </div>
      ),
    },
    { key: "ownerName", header: t("kyc.table.columns.owner"), sortable: true },
    { key: "category", header: t("kyc.table.columns.category"), sortable: true },
    {
      key: "kycStatus",
      header: t("kyc.table.columns.status"),
      sortable: true,
      render: (v) => {
        const s = kycStatusStyle[v as KycStatus];

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`common.status.${v as string}`, v as string)}
          </span>
        );
      },
    },
    { key: "submittedAt", header: t("kyc.table.columns.submitted"), sortable: true },
  ];

  const rowActions: RowAction<KycRow>[] = [
    { label: t("common.actions.viewDetails"), icon: Eye, onClick: (r) => setViewTarget(r.vendor) },
    {
      label: t("common.actions.approve"),
      icon: CheckCircle2,
      onClick: (r) => setApproveTarget(r.vendor),
      hidden: (r) => r.kycStatus !== "pending",
    },
    {
      label: t("common.actions.reject"),
      icon: XCircle,
      variant: "destructive",
      onClick: (r) => setRejectTarget(r.vendor),
      hidden: (r) => r.kycStatus !== "pending",
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("kyc.topbarTitle")}>
      <DataTable<KycRow>
        title={t("kyc.table.title")}
        description={t("kyc.table.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("kyc.table.searchPlaceholder")}
        searchKeys={["nameEn", "nameAr", "ownerName"]}
        filters={[
          {
            key: "kycStatus",
            label: t("kyc.table.filterStatus"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.approved"), value: "approved" },
              { label: t("common.status.rejected"), value: "rejected" },
            ],
          },
        ]}
        rowActions={rowActions}
        rowActionsVariant="inline"
        pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
        defaultSort={{ key: "submittedAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("kyc.stats.pending"),
            value: pendingCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("kyc.stats.approvedToday"),
            value: approvedTodayCount,
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("kyc.stats.totalVendors"),
            value: vendors.length,
            icon: Store,
            variant: "primary",
          },
        ]}
        emptyState={{
          title: t("kyc.table.emptyTitle"),
          description: t("kyc.table.emptyDescription"),
        }}
      />

      <KycDetailsDialog
        open={!!viewTarget}
        onOpenChange={(o) => {
          if (!o) {
            setViewTarget(null);
          }
        }}
        vendor={viewTarget}
      />
      <KycApproveDialog
        open={!!approveTarget}
        onOpenChange={(o) => {
          if (!o) {
            setApproveTarget(null);
          }
        }}
        vendor={approveTarget}
        onApprove={approve}
      />
      <KycRejectDialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
          }
        }}
        vendor={rejectTarget}
        onReject={reject}
      />
    </DashboardLayout>
  );
}
