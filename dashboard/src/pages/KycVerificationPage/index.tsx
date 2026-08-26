import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, FileText, FileWarning, Users, XCircle } from "lucide-react";

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

// Focused queue of vendors awaiting approval — a filtered view over the same
// data/endpoints as /admin/vendors, kept as its own page for admins who only
// care about the review queue. See local-be's "KYC" == vendor pending_approval
// + the optional kycDocumentUrl captured at registration.
export default function KycVerificationPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<AdminVendorRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminVendorRow | null>(null);
  // This page only ever loads the pending_approval subset, so total vendor
  // count (any status) needs its own lightweight request — same limit:1
  // precedent as UserManagementPage's stats strip.
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalLoading, setTotalLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await adminApi.listVendors({ status: "pending_approval" });
      setVendors(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("kyc.management.toasts.loadFailed")));
    } finally {
      setLoading(false);
    }
  }

  async function loadTotalVendors() {
    setTotalLoading(true);
    try {
      const { pagination } = await adminApi.listVendors({ limit: 1 });
      setTotalVendors(pagination.total);
    } catch {
      // Secondary, non-blocking figure — leave the prior value on failure.
    } finally {
      setTotalLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void loadTotalVendors();
  }, []);

  async function handleApprove(id: string, notes: string) {
    try {
      await adminApi.approveVendor(id, notes || undefined);
      toast.success(t("kyc.management.toasts.approved"));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("kyc.management.toasts.approveFailed")));
    }
  }

  async function handleReject(id: string, reason: string, category: string) {
    try {
      await adminApi.rejectVendor(id, reason, category);
      toast.success(t("kyc.management.toasts.rejected"));
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("kyc.management.toasts.rejectFailed")));
    }
  }

  const columns: ColumnDef<AdminVendorRow>[] = [
    {
      key: "storeName",
      header: t("kyc.management.columns.store"),
      render: (v) => <span className="font-medium">{v as string}</span>,
    },
    {
      key: "ownerName",
      header: t("kyc.management.columns.owner"),
      render: (v) => (v as string) || "—",
    },
    {
      key: "ownerPhone",
      header: t("kyc.management.columns.phone"),
      render: (v) => (v as string) || "—",
    },
    { key: "city", header: t("kyc.management.columns.city"), render: (v) => (v as string) || "—" },
    {
      key: "kycDocumentUrl",
      header: t("kyc.management.columns.document"),
      render: (v) =>
        v ? (
          <a
            href={v as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            {t("kyc.management.document.view")}
          </a>
        ) : (
          <span className="text-gray-400">{t("kyc.management.document.notProvided")}</span>
        ),
    },
    {
      key: "createdAt",
      header: t("kyc.management.columns.submitted"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<AdminVendorRow>[] = [
    {
      label: t("kyc.management.actions.approve"),
      icon: CheckCircle2,
      onClick: (row) => setApproveTarget(row),
    },
    {
      label: t("kyc.management.actions.reject"),
      icon: XCircle,
      variant: "destructive",
      onClick: (row) => setRejectTarget(row),
    },
  ];

  const missingDocuments = vendors.filter((v) => !v.kycDocumentUrl).length;

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("kyc.management.topbarTitle")}>
      <DataTable<AdminVendorRow>
        data={vendors}
        columns={columns}
        rowKey="id"
        searchable
        searchKeys={["storeName", "ownerName", "ownerPhone"]}
        rowActions={rowActions}
        stats={[
          {
            title: t("kyc.stats.pending"),
            value: vendors.length,
            icon: Clock,
            variant: "warning",
            loading,
          },
          {
            title: t("kyc.stats.missingDocuments"),
            value: missingDocuments,
            icon: FileWarning,
            variant: "danger",
            loading,
          },
          {
            title: t("kyc.stats.totalVendors"),
            value: totalVendors,
            icon: Users,
            variant: "primary",
            loading: totalLoading,
          },
        ]}
        pagination={{ pageSize: 10 }}
        loading={loading}
        striped
        emptyState={{
          title: t("kyc.management.empty.title"),
          description: t("kyc.management.empty.description"),
        }}
      />

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
    </DashboardLayout>
  );
}
