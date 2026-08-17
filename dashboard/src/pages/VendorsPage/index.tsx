import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldOff,
  FileText,
  Phone,
  Mail,
  Pencil,
  KeyRound,
  Trash2,
  Percent,
} from "lucide-react";

import VendorViewDialog from "./VendorViewDialog";
import VendorEditDialog, { type VendorEditValues } from "./VendorEditDialog";
import VendorPasswordDialog from "./VendorPasswordDialog";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { initialVendors, type Vendor, type VendorStatus } from "@/data/vendors";

// ── Style maps ────────────────────────────────────────────────────────────────
const approvalStyle: Record<VendorStatus, { text: string; bg: string; dot: string }> = {
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
  suspended: { text: "text-muted-foreground", bg: "bg-muted", dot: "bg-slate-400" },
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

const TABS = [
  { id: "approved", icon: CheckCircle2 },
  { id: "pending", icon: Clock },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ── Inline action icons (outside component to avoid hook issues) ──────────────
interface ActionIconsProps {
  row: Vendor;
  onView: (v: Vendor) => void;
  onEdit: (v: Vendor) => void;
  onPassword: (v: Vendor) => void;
  onDelete: (v: Vendor) => void;
}

function ActionIcons({ row, onView, onEdit, onPassword, onDelete }: ActionIconsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        title={t("common.actions.view")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
        onClick={() => onView(row)}
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        title={t("common.actions.edit")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        onClick={() => onEdit(row)}
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        title={t("vendors.actions.changePassword")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        onClick={() => onPassword(row)}
      >
        <KeyRound className="w-4 h-4" />
      </button>
      <button
        title={t("common.actions.delete")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        onClick={() => onDelete(row)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VendorsPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [activeTab, setActiveTab] = useState<TabId>("approved");

  // Dialog state
  const [viewTarget, setViewTarget] = useState<Vendor | null>(null);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  function updateStatus(id: number, status: VendorStatus) {
    const now = new Date().toISOString();
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status, updatedAt: now, approvedAt: status === "approved" ? now : v.approvedAt }
          : v
      )
    );
  }

  function approve(v: Vendor) {
    updateStatus(v.id, "approved");
    toast.success(t("vendors.toasts.approvedBody", { name: v.nameEn }), {
      title: t("vendors.toasts.approvedTitle"),
    });
  }

  function reject(v: Vendor) {
    updateStatus(v.id, "rejected");
    toast.error(t("vendors.toasts.rejectedBody", { name: v.nameEn }), {
      title: t("vendors.toasts.rejectedTitle"),
    });
  }

  function handleEdit(values: VendorEditValues, id: number) {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              nameEn: values.nameEn,
              nameAr: values.nameAr,
              ownerName: values.ownerName,
              email: values.email,
              phone: values.phone,
              category: values.category,
              city: values.city,
              commission: { ...v.commission, value: values.commissionValue },
              status: values.status,
              updatedAt: new Date().toISOString(),
            }
          : v
      )
    );
    toast.success(t("vendors.toasts.updatedBody", { name: values.nameEn }), {
      title: t("vendors.toasts.updatedTitle"),
    });
  }

  function handlePasswordChange(_password: string, id: number) {
    const vendor = vendors.find((v) => v.id === id);
    toast.success(t("vendors.toasts.passwordChangedBody", { name: vendor?.nameEn }), {
      title: t("vendors.toasts.passwordChangedTitle"),
    });
  }

  function handleDelete(vendor: Vendor) {
    setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    toast.error(t("vendors.toasts.deletedBody", { name: vendor.nameEn }), {
      title: t("vendors.toasts.deletedTitle"),
    });
  }

  const pendingVendors = useMemo(() => vendors.filter((v) => v.status === "pending"), [vendors]);

  const approvedVendors = useMemo(
    () => vendors.filter((v) => v.status === "approved" || v.status === "suspended"),
    [vendors]
  );

  // ── Columns ───────────────────────────────────────────────────────────────
  const pendingColumns: ColumnDef<Vendor>[] = [
    {
      key: "nameEn",
      header: t("vendors.columns.vendor"),
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
            <p className="text-xs text-muted-foreground truncate">{row.ownerName}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: t("vendors.columns.category"), sortable: true },
    { key: "city", header: t("vendors.columns.city"), sortable: true },
    {
      key: "documents",
      header: t("vendors.columns.documents"),
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          {t("vendors.columns.documentsCount", { count: (v as Vendor["documents"]).length })}
        </span>
      ),
    },
    { key: "createdAt", header: t("vendors.columns.submitted"), sortable: true },
    {
      key: "status",
      header: t("vendors.columns.status"),
      sortable: true,
      render: (v) => {
        const s = approvalStyle[v as VendorStatus];

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
  ];

  const approvedColumns: ColumnDef<Vendor>[] = [
    {
      key: "nameEn",
      header: t("vendors.columns.providerName"),
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
          <p className="font-medium text-sm truncate">{row.nameEn}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: t("vendors.columns.phone"),
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {v as string}
        </span>
      ),
    },
    {
      key: "email",
      header: t("vendors.columns.email"),
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="w-3.5 h-3.5 shrink-0" />
          {v as string}
        </span>
      ),
    },
    {
      key: "commission",
      header: t("vendors.dialog.commission"),
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Percent className="w-3.5 h-3.5 shrink-0" />
          {row.commission.type === "percentage"
            ? `${row.commission.value}%`
            : `${row.commission.value} KWD`}
        </span>
      ),
    },
    {
      key: "status",
      header: t("vendors.columns.approvalStatus"),
      sortable: true,
      render: (v) => {
        const s = approvalStyle[v as VendorStatus];

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
    {
      key: "id",
      header: t("vendors.columns.actions"),
      align: "right",
      render: (_, row) => (
        <ActionIcons
          row={row}
          onView={setViewTarget}
          onEdit={setEditTarget}
          onPassword={setPasswordTarget}
          onDelete={setDeleteTarget}
        />
      ),
    },
  ];

  const pendingRowActions: RowAction<Vendor>[] = [
    { label: t("common.actions.view"), icon: Eye, onClick: (r) => setViewTarget(r) },
    { label: t("common.actions.approve"), icon: CheckCircle2, onClick: approve },
    { label: t("common.actions.reject"), icon: XCircle, onClick: reject, variant: "destructive" },
  ];

  const pendingCount = pendingVendors.length;
  const approvedCount = vendors.filter((v) => v.status === "approved").length;
  const rejectedCount = vendors.filter((v) => v.status === "rejected").length;
  const suspendedCount = vendors.filter((v) => v.status === "suspended").length;

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("vendors.topbarTitle")}>
      <div className="flex flex-col gap-5">
        {/* Tab switcher */}
        <div className="inline-flex items-center gap-1 bg-card border rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {t(`vendors.tabs.${tab.id}`)}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.id ? "bg-white/20" : "bg-muted text-muted-foreground"
                )}
              >
                {tab.id === "pending" ? pendingCount : approvedVendors.length}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "pending" ? (
          <DataTable<Vendor>
            title={t("vendors.pending.title")}
            description={t("vendors.pending.description")}
            data={pendingVendors}
            columns={pendingColumns}
            rowKey="id"
            searchable
            searchPlaceholder={t("vendors.searchPlaceholder")}
            searchKeys={["nameEn", "ownerName", "email"]}
            filters={[
              {
                key: "category",
                label: t("vendors.filterCategory"),
                options: Array.from(new Set(initialVendors.map((v) => v.category))).map((c) => ({
                  label: c,
                  value: c,
                })),
              },
            ]}
            rowActions={pendingRowActions}
            pagination={{ pageSize: 8 }}
            defaultSort={{ key: "createdAt", direction: "desc" }}
            striped
            stats={[
              {
                title: t("vendors.stats.pendingReview"),
                value: pendingCount,
                icon: Clock,
                variant: "warning",
              },
              {
                title: t("vendors.stats.approved"),
                value: approvedCount,
                icon: CheckCircle2,
                variant: "success",
              },
              {
                title: t("vendors.stats.rejected"),
                value: rejectedCount,
                icon: XCircle,
                variant: "danger",
              },
              {
                title: t("vendors.stats.totalVendors"),
                value: vendors.length,
                icon: Store,
                variant: "primary",
              },
            ]}
            emptyState={{
              title: t("vendors.pending.emptyTitle"),
              description: t("vendors.pending.emptyDescription"),
            }}
          />
        ) : (
          <DataTable<Vendor>
            title={t("vendors.approved.title")}
            description={t("vendors.approved.description")}
            data={approvedVendors}
            columns={approvedColumns}
            rowKey="id"
            searchable
            searchPlaceholder={t("vendors.searchPlaceholder")}
            searchKeys={["nameEn", "ownerName", "email"]}
            filters={[
              {
                key: "status",
                label: t("vendors.filterStatus"),
                options: [
                  { label: t("common.status.approved"), value: "approved" },
                  { label: t("common.status.suspended"), value: "suspended" },
                ],
              },
              {
                key: "category",
                label: t("vendors.filterCategory"),
                options: Array.from(new Set(initialVendors.map((v) => v.category))).map((c) => ({
                  label: c,
                  value: c,
                })),
              },
            ]}
            pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
            defaultSort={{ key: "createdAt", direction: "desc" }}
            striped
            stats={[
              {
                title: t("vendors.stats.liveVendors"),
                value: approvedCount,
                icon: CheckCircle2,
                variant: "success",
              },
              {
                title: t("vendors.stats.suspended"),
                value: suspendedCount,
                icon: ShieldOff,
                variant: "danger",
              },
            ]}
            emptyState={{
              title: t("vendors.approved.emptyTitle"),
              description: t("vendors.approved.emptyDescription"),
            }}
          />
        )}
      </div>

      {/* Modals */}
      <VendorViewDialog
        open={!!viewTarget}
        onOpenChange={(o) => {
          if (!o) {
            setViewTarget(null);
          }
        }}
        vendor={viewTarget}
      />
      <VendorEditDialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) {
            setEditTarget(null);
          }
        }}
        vendor={editTarget}
        onSubmit={handleEdit}
      />
      <VendorPasswordDialog
        open={!!passwordTarget}
        onOpenChange={(o) => {
          if (!o) {
            setPasswordTarget(null);
          }
        }}
        vendor={passwordTarget}
        onSubmit={handlePasswordChange}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteTarget(null);
          }
        }}
        title={t("vendors.dialog.deleteTitle")}
        description={t("vendors.dialog.deleteDescription", { name: deleteTarget?.nameEn })}
        confirmLabel={t("common.actions.delete")}
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget);
          }

          setDeleteTarget(null);
        }}
      />
    </DashboardLayout>
  );
}
