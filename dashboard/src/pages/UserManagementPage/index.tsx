import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, ShieldOff, ShieldCheck, Trash2, UserPlus, Users, UserX } from "lucide-react";

import UserViewDialog from "./UserViewDialog";
import UserAddDialog from "./UserAddDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable, renderDate } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as adminApi from "@/lib/adminApi";
import type { AdminUserRow } from "@/lib/adminApi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
  deleted: "neutral",
};

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  admin: "purple",
  vendor: "info",
  customer: "warning",
};

export default function UserManagementPage() {
  const { t } = useTranslation();
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
  const [addOpen, setAddOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, suspended: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Independent of the paginated/search-filtered `users` list above — these
  // counts always reflect every customer, not just the current page/filter,
  // so they're fetched via separate limit:1 requests keyed off pagination.total.
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [total, active, inactive, suspended] = await Promise.all([
        adminApi.listUsers({ role: "customer", limit: 1 }),
        adminApi.listUsers({ role: "customer", status: "active", limit: 1 }),
        adminApi.listUsers({ role: "customer", status: "inactive", limit: 1 }),
        adminApi.listUsers({ role: "customer", status: "suspended", limit: 1 }),
      ]);
      setStats({
        total: total.pagination.total,
        active: active.pagination.total,
        inactive: inactive.pagination.total,
        suspended: suspended.pagination.total,
      });
    } catch {
      // Stats are a secondary, non-blocking strip — leave prior values on failure.
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

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
      toast.error(getApiErrorMessage(error, t("users.management.toasts.loadFailed")));
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
      toast.success(
        nextStatus === "active"
          ? t("users.management.toasts.activated")
          : t("users.management.toasts.suspended")
      );
      setSuspendTarget(null);
      void load();
      void loadStats();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("users.management.toasts.actionFailed")));
    }
  }

  async function handleDeleteConfirm(user: AdminUserRow) {
    try {
      await adminApi.deleteUser(user.id);
      toast.success(t("users.management.toasts.deleted"));
      setDeleteTarget(null);
      void load();
      void loadStats();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("users.management.toasts.actionFailed")));
    }
  }

  const columns: ColumnDef<AdminUserRow>[] = [
    {
      key: "name",
      header: t("users.management.columns.name"),
      render: (_v, row) => (
        <div>
          <p className="font-medium">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: t("users.management.columns.email"),
      render: (v) => (v as string) || "—",
    },
    {
      key: "role",
      header: t("users.management.columns.role"),
      render: (v) => (
        <Badge variant={ROLE_VARIANT[v as string] ?? "neutral"} className="capitalize">
          {t(`common.status.${v as string}`, v as string)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("users.management.columns.status"),
      render: (v) => (
        <Badge variant={STATUS_VARIANT[v as string] ?? "neutral"}>
          {t(`common.status.${v as string}`, v as string)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("users.management.columns.joined"),
      sortable: true,
      render: renderDate,
    },
  ];

  const rowActions: RowAction<AdminUserRow>[] = [
    { label: t("users.management.actions.view"), icon: Eye, onClick: (row) => setViewTarget(row) },
    {
      label: t("users.management.actions.suspend"),
      icon: ShieldOff,
      variant: "warning",
      hidden: (row) => row.status === "suspended",
      onClick: (row) => setSuspendTarget(row),
    },
    {
      label: t("users.management.actions.activate"),
      icon: ShieldCheck,
      hidden: (row) => row.status !== "suspended",
      onClick: (row) => setSuspendTarget(row),
    },
    {
      label: t("users.management.actions.deletePermanent"),
      icon: Trash2,
      variant: "destructive",
      onClick: (row) => setDeleteTarget(row),
    },
  ];

  const toolbarActions: ToolbarAction<AdminUserRow>[] = [
    {
      label: t("users.management.actions.addUser"),
      icon: UserPlus,
      onClick: () => setAddOpen(true),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("users.topbarTitle")}>
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
            label: t("users.management.filters.status"),
            options: [
              { label: t("users.management.filters.active"), value: "active" },
              { label: t("users.management.filters.inactive"), value: "inactive" },
              { label: t("users.management.filters.suspended"), value: "suspended" },
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
        toolbarActions={toolbarActions}
        stats={[
          {
            title: t("users.management.stats.total"),
            value: stats.total,
            icon: Users,
            variant: "primary",
            loading: statsLoading,
          },
          {
            title: t("users.management.stats.active"),
            value: stats.active,
            icon: ShieldCheck,
            variant: "success",
            loading: statsLoading,
          },
          {
            title: t("users.management.stats.inactive"),
            value: stats.inactive,
            icon: UserX,
            variant: "default",
            loading: statsLoading,
          },
          {
            title: t("users.management.stats.suspended"),
            value: stats.suspended,
            icon: ShieldOff,
            variant: "danger",
            loading: statsLoading,
          },
        ]}
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

      <UserAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          setPage(1);
          void load();
          void loadStats();
        }}
      />

      <UserViewDialog
        open={!!viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        user={viewTarget}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        title={
          suspendTarget?.status === "suspended"
            ? t("users.management.confirm.activateTitle")
            : t("users.management.confirm.suspendTitle")
        }
        description={
          suspendTarget?.status === "suspended"
            ? t("users.management.confirm.activateDesc")
            : t("users.management.confirm.suspendDesc")
        }
        variant={suspendTarget?.status === "suspended" ? "default" : "destructive"}
        onConfirm={() => suspendTarget && handleSuspendConfirm(suspendTarget)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("users.management.confirm.deleteTitle")}
        description={t("users.management.confirm.deleteDesc")}
        variant="destructive"
        confirmLabel={t("users.management.confirm.deleteButton")}
        onConfirm={() => deleteTarget && handleDeleteConfirm(deleteTarget)}
      />
    </DashboardLayout>
  );
}
