import { useEffect, useState } from "react";
import { CheckCircle2, Eye, ShieldOff, XCircle } from "lucide-react";

import VendorViewDialog from "./VendorViewDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
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
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<AdminVendorRow | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminVendorRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminVendorRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminVendorRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await adminApi.listVendors();
      setVendors(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load vendors"));
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
      toast.success("Vendor approved");
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to approve vendor"));
    }
  }

  async function handleReject(id: string, reason: string, category: string) {
    try {
      await adminApi.rejectVendor(id, reason, category);
      toast.success("Vendor rejected");
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reject vendor"));
    }
  }

  async function handleSuspend(id: string, reason: string, duration?: number) {
    try {
      await adminApi.suspendVendor(id, reason, duration);
      toast.success("Vendor suspended");
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to suspend vendor"));
    }
  }

  const columns: ColumnDef<AdminVendorRow>[] = [
    { key: "storeName", header: "Store", render: (v) => <span className="font-medium">{v as string}</span> },
    { key: "ownerName", header: "Owner", render: (v) => (v as string) || "—" },
    { key: "ownerPhone", header: "Phone", render: (v) => (v as string) || "—" },
    { key: "ownerEmail", header: "Email", render: (v) => (v as string) || "—" },
    {
      key: "status",
      header: "Status",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[v as string]}`}>
          {(v as string).replace("_", " ")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<AdminVendorRow>[] = [
    { label: "View", icon: Eye, onClick: (row) => setViewTarget(row) },
    {
      label: "Approve",
      icon: CheckCircle2,
      hidden: (row) => row.status !== "pending_approval",
      onClick: (row) => setApproveTarget(row),
    },
    {
      label: "Reject",
      icon: XCircle,
      variant: "destructive",
      hidden: (row) => row.status !== "pending_approval",
      onClick: (row) => setRejectTarget(row),
    },
    {
      label: "Suspend",
      icon: ShieldOff,
      variant: "warning",
      hidden: (row) => row.status !== "active",
      onClick: (row) => setSuspendTarget(row),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="Vendors">
      <DataTable<AdminVendorRow>
        data={vendors}
        columns={columns}
        rowKey="id"
        searchable
        searchKeys={["storeName", "ownerName", "ownerPhone", "city"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Pending approval", value: "pending_approval" },
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        rowActions={rowActions}
        pagination={{ pageSize: 10 }}
        loading={loading}
        striped
      />

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
