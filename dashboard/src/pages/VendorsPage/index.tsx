import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Eye, ShieldOff, Store, XCircle } from "lucide-react";

import VendorViewDialog from "./VendorViewDialog";
import VendorAddDialog from "./VendorAddDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as adminApi from "@/lib/adminApi";
import type { AdminVendorRow } from "@/lib/adminApi";
import VendorApproveDialog from "@/components/vendor/VendorApproveDialog";
import VendorRejectDialog from "@/components/vendor/VendorRejectDialog";
import VendorSuspendDialog from "@/components/vendor/VendorSuspendDialog";

const STATUS_BADGE: Record<string, string> = {
  pending_approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function VendorsPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<AdminVendorRow | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminVendorRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminVendorRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminVendorRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await adminApi.listVendors();
      setVendors(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendors.management.toasts.loadFailed")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleApprove(id: string, notes: string) {
    try {
      await adminApi.approveVendor(id, notes || undefined);
      toast.success(t("vendors.management.toasts.approved"));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendors.management.toasts.actionFailed")));
    }
  }

  async function handleReject(id: string, reason: string, category: string) {
    try {
      await adminApi.rejectVendor(id, reason, category);
      toast.success(t("vendors.management.toasts.rejected"));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendors.management.toasts.actionFailed")));
    }
  }

  async function handleSuspend(id: string, reason: string, duration?: number) {
    try {
      await adminApi.suspendVendor(id, reason, duration);
      toast.success(t("vendors.management.toasts.suspended"));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendors.management.toasts.actionFailed")));
    }
  }

  const columns: ColumnDef<AdminVendorRow>[] = [
    { key: "storeName", header: t("vendors.management.columns.store"), render: (v) => <span className="font-medium">{v as string}</span> },
    { key: "ownerName", header: t("vendors.management.columns.owner"), render: (v) => (v as string) || "—" },
    { key: "ownerPhone", header: t("vendors.management.columns.phone"), render: (v) => (v as string) || "—" },
    { key: "ownerEmail", header: t("users.management.columns.email"), render: (v) => (v as string) || "—" },
    {
      key: "status",
      header: t("vendors.management.columns.status"),
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[v as string]}`}>
          {t(`common.status.${v as string}`, (v as string).replace("_", " "))}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("vendors.management.columns.joined"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<AdminVendorRow>[] = [
    { label: t("vendors.management.actions.view"), icon: Eye, onClick: (row) => setViewTarget(row) },
    {
      label: t("vendors.management.actions.approve"),
      icon: CheckCircle2,
      hidden: (row) => row.status !== "pending_approval",
      onClick: (row) => setApproveTarget(row),
    },
    {
      label: t("vendors.management.actions.reject"),
      icon: XCircle,
      variant: "destructive",
      hidden: (row) => row.status !== "pending_approval",
      onClick: (row) => setRejectTarget(row),
    },
    {
      label: t("vendors.management.actions.suspend"),
      icon: ShieldOff,
      variant: "warning",
      hidden: (row) => row.status !== "active",
      onClick: (row) => setSuspendTarget(row),
    },
  ];

  const toolbarActions: ToolbarAction<AdminVendorRow>[] = [
    { label: t("vendors.management.actions.addVendor"), icon: Store, onClick: () => setAddOpen(true) },
  ];

  // Derived straight from the already-loaded `vendors` list rather than
  // separate requests — listVendors() fetches up to 100 rows in one call
  // (see adminApi.ts), the same set this page already paginates client-side.
  const statCounts = {
    total: vendors.length,
    pendingApproval: vendors.filter((v) => v.status === "pending_approval").length,
    active: vendors.filter((v) => v.status === "active").length,
    suspended: vendors.filter((v) => v.status === "suspended").length,
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("vendors.topbarTitle")}>
      <DataTable<AdminVendorRow>
        data={vendors}
        columns={columns}
        rowKey="id"
        searchable
        searchKeys={["storeName", "ownerName", "ownerPhone", "city"]}
        filters={[
          {
            key: "status",
            label: t("vendors.management.filters.status"),
            options: [
              { label: t("vendors.management.filters.pendingApproval"), value: "pending_approval" },
              { label: t("vendors.management.filters.active"), value: "active" },
              { label: t("vendors.management.filters.suspended"), value: "suspended" },
              { label: t("vendors.management.filters.inactive"), value: "inactive" },
            ],
          },
        ]}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        stats={[
          {
            title: t("vendors.management.stats.total"),
            value: statCounts.total,
            icon: Store,
            variant: "primary",
            loading,
          },
          {
            title: t("vendors.management.stats.pendingApproval"),
            value: statCounts.pendingApproval,
            icon: Clock,
            variant: "warning",
            loading,
          },
          {
            title: t("vendors.management.stats.active"),
            value: statCounts.active,
            icon: CheckCircle2,
            variant: "success",
            loading,
          },
          {
            title: t("vendors.management.stats.suspended"),
            value: statCounts.suspended,
            icon: ShieldOff,
            variant: "danger",
            loading,
          },
        ]}
        pagination={{ pageSize: 10 }}
        loading={loading}
        striped
        emptyState={{
          title: t("vendors.management.empty.title"),
          description: t("vendors.management.empty.description"),
        }}
      />

      <VendorAddDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => void load()} />

      <VendorViewDialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)} vendor={viewTarget} />
      <VendorApproveDialog
        open={!!approveTarget}
        onOpenChange={(o) => !o && setApproveTarget(null)}
        vendor={approveTarget}
        onApprove={handleApprove}
      />
      <VendorRejectDialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        vendor={rejectTarget}
        onReject={handleReject}
      />
      <VendorSuspendDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        vendor={suspendTarget}
        onSuspend={handleSuspend}
      />
    </DashboardLayout>
  );
}
