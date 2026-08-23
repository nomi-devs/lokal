import { useEffect, useState } from "react";
import { Eye, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";

import UserViewDialog from "./UserViewDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as adminApi from "@/lib/adminApi";
import type { AdminUserRow } from "@/lib/adminApi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  deleted: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  vendor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  customer: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  driver: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [viewTarget, setViewTarget] = useState<AdminUserRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      // Vendors and admins have their own dedicated pages (/admin/vendors,
      // seed-only admin) — this page is customer account management. Search
      // and status are sent to the backend so filtering covers every
      // customer, not just whatever page happens to be loaded.
      const resp = await adminApi.listUsers({
        role: "customer",
        page,
        limit: pageSize,
        search: search || undefined,
        status: status || undefined,
      });
      setUsers(resp.data);
      setTotal(resp.pagination.total);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }

  // Search is debounced (and resets to page 1) so typing doesn't fire a
  // request per keystroke; page/pageSize/status changes fetch immediately.
  useEffect(() => {
    const id = setTimeout(() => void load(), search ? SEARCH_DEBOUNCE_MS : 0);

    return () => clearTimeout(id);
     
  }, [page, pageSize, status, search]);

  async function handleSuspendConfirm(user: AdminUserRow) {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      toast.success(`${user.firstName || user.phone} is now ${nextStatus}`);
      setSuspendTarget(null);
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  }

  async function handleDeleteConfirm(user: AdminUserRow) {
    try {
      await adminApi.deleteUser(user.id);
      toast.success(`${user.firstName || user.phone} deleted permanently`);
      setDeleteTarget(null);
      void load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    }
  }

  const columns: ColumnDef<AdminUserRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (_v, row) => (
        <div>
          <p className="font-medium">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</p>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (v) => (v as string) || "—" },
    {
      key: "role",
      header: "Role",
      render: (v) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[v as string] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
        >
          {v as string}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[v as string]}`}>
          {v as string}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<AdminUserRow>[] = [
    { label: "View", icon: Eye, onClick: (row) => setViewTarget(row) },
    {
      label: "Suspend",
      icon: ShieldOff,
      variant: "warning",
      hidden: (row) => row.status === "suspended",
      onClick: (row) => setSuspendTarget(row),
    },
    {
      label: "Activate",
      icon: ShieldCheck,
      hidden: (row) => row.status !== "suspended",
      onClick: (row) => setSuspendTarget(row),
    },
    { label: "Delete permanently", icon: Trash2, variant: "destructive", onClick: (row) => setDeleteTarget(row) },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="User Management">
      <DataTable<AdminUserRow>
        data={users}
        columns={columns}
        rowKey="id"
        searchable
        onSearchChange={(q) => {
          setPage(1);
          setSearch(q);
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setPage(1);
            setStatus(value);
          }
        }}
        rowActions={rowActions}
        pagination={{
          pageSize,
          serverSide: true,
          totalCount: total,
          onPageChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
        loading={loading}
        striped
      />

      <UserViewDialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)} user={viewTarget} />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        title={suspendTarget?.status === "suspended" ? "Activate user?" : "Suspend user?"}
        description={
          suspendTarget?.status === "suspended"
            ? "This user will regain access immediately."
            : "This user will be unable to log in until reactivated."
        }
        variant={suspendTarget?.status === "suspended" ? "default" : "destructive"}
        onConfirm={() => suspendTarget && handleSuspendConfirm(suspendTarget)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete user permanently?"
        description="This cannot be undone — the account and its data are removed immediately."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDeleteConfirm(deleteTarget)}
      />
    </DashboardLayout>
  );
}
