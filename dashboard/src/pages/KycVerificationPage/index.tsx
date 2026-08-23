import { useEffect, useState } from "react";
import { CheckCircle2, FileText, XCircle } from "lucide-react";

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
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<AdminVendorRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminVendorRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await adminApi.listVendors({ status: "pending_approval" });
      setVendors(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load pending vendors"));
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

  const columns: ColumnDef<AdminVendorRow>[] = [
    { key: "storeName", header: "Store", render: (v) => <span className="font-medium">{v as string}</span> },
    { key: "ownerName", header: "Owner", render: (v) => (v as string) || "—" },
    { key: "ownerPhone", header: "Phone", render: (v) => (v as string) || "—" },
    { key: "city", header: "City", render: (v) => (v as string) || "—" },
    {
      key: "kycDocumentUrl",
      header: "Document",
      render: (v) =>
        v ? (
          <a
            href={v as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            View
          </a>
        ) : (
          <span className="text-gray-400">Not provided</span>
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
    { label: "Approve", icon: CheckCircle2, onClick: (row) => setApproveTarget(row) },
    { label: "Reject", icon: XCircle, variant: "destructive", onClick: (row) => setRejectTarget(row) },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="KYC Verification">
      <DataTable<AdminVendorRow>
        data={vendors}
        columns={columns}
        rowKey="id"
        searchable
        searchKeys={["storeName", "ownerName", "ownerPhone"]}
        rowActions={rowActions}
        pagination={{ pageSize: 10 }}
        loading={loading}
        striped
        emptyState={{ title: "No vendors pending review", description: "New registrations will show up here." }}
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
