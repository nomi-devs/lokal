import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Phone,
  Mail,
  UserMinus,
  RotateCcw,
  AlertTriangle,
  KeyRound,
} from "lucide-react";

import UserViewDialog from "./UserViewDialog";
import UserFormDialog, { type UserFormValues } from "./UserFormDialog";
import UserPasswordDialog from "./UserPasswordDialog";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { users as initialUsers, type User } from "@/data/users";

const fullName = (u: User) => `${u.firstName} ${u.lastName}`.trim();

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<User["status"], { text: string; bg: string; dot: string }> = {
  active: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  suspended: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
  inactive: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
};

const roleBadge: Record<User["role"], string> = {
  user: "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/30",
  vendor: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  admin: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
};

const avatarColor = (name: string) => {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];

  return colors[name.charCodeAt(0) % colors.length];
};

// ── Inline action icons (outside component) ───────────────────────────────────
interface ActionIconsProps {
  row: User;
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onPassword: (u: User) => void;
  onSuspend: (u: User) => void;
  onDelete: (u: User) => void;
}

function ActionIcons({ row, onView, onEdit, onPassword, onSuspend, onDelete }: ActionIconsProps) {
  const { t } = useTranslation();
  const isSuspended = row.status === "suspended";

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        title={t("common.actions.view")}
        onClick={() => onView(row)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        title={t("common.actions.edit")}
        onClick={() => onEdit(row)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        title={t("users.view.changePasswordTitle")}
        onClick={() => onPassword(row)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
      >
        <KeyRound className="w-4 h-4" />
      </button>
      <button
        title={isSuspended ? t("common.actions.activate") : t("common.actions.suspend")}
        onClick={() => onSuspend(row)}
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
          isSuspended
            ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        }`}
      >
        {isSuspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
      </button>
      <button
        title={t("users.actions.delete")}
        onClick={() => onDelete(row)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const { t } = useTranslation();
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [tab, setTab] = useState<"active" | "deleted">("active");

  // Dialog targets
  const [viewTarget, setViewTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<User | null>(null);

  const activeUsers = userList.filter((u) => !u.deletedAt);
  const deletedUsers = userList.filter((u) => !!u.deletedAt);

  const active = activeUsers.filter((u) => u.status === "active").length;
  const suspended = activeUsers.filter((u) => u.status === "suspended").length;
  const inactive = activeUsers.filter((u) => u.status === "inactive").length;

  function handleSuspendConfirm(user: User) {
    const isSuspended = user.status === "suspended";
    setUserList((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: isSuspended ? "active" : "suspended" } : u
      )
    );
    toast.success(
      isSuspended
        ? t("users.toasts.activated", { name: fullName(user) })
        : t("users.toasts.suspended", { name: fullName(user) })
    );
  }

  function softDelete(user: User) {
    setUserList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, deletedAt: new Date().toISOString() } : u))
    );
    toast.success(t("users.toasts.softDeleted", { name: fullName(user) }));
  }

  function restore(user: User) {
    setUserList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, deletedAt: undefined, status: "active" } : u))
    );
    toast.success(t("users.deleted.toastRestored", { name: fullName(user) }));
  }

  function hardDelete(user: User) {
    setUserList((prev) => prev.filter((u) => u.id !== user.id));
    toast.error(t("users.deleted.toastHardDeleted", { name: fullName(user) }));
  }

  function handlePasswordChange(_password: string, id: number) {
    const user = userList.find((u) => u.id === id);
    toast.success(t("vendors.toasts.passwordChangedBody", { name: user ? fullName(user) : "" }), {
      title: t("vendors.toasts.passwordChangedTitle"),
    });
  }

  function handleFormSubmit(values: UserFormValues, editingId: number | null) {
    const now = new Date().toISOString();

    if (editingId != null) {
      setUserList((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? {
                ...u,
                firstName: values.firstName,
                lastName: values.lastName ?? "",
                email: values.email || undefined,
                phone: values.phone,
                role: values.role,
                language: values.language,
                status: values.status,
                username: values.username,
                gender: values.gender || undefined,
                birthday: values.birthday,
                profilePicture: values.profilePicture,
                profileBackground: values.profileBackground,
                updatedAt: now,
              }
            : u
        )
      );
      toast.success(
        t("users.toasts.updated", { name: `${values.firstName} ${values.lastName}`.trim() })
      );

      return;
    }

    const nextId = Math.max(0, ...userList.map((u) => u.id)) + 1;
    setUserList((prev) => [
      ...prev,
      {
        id: nextId,
        firstName: values.firstName,
        lastName: values.lastName ?? "",
        email: values.email || undefined,
        phone: values.phone,
        role: values.role,
        language: values.language,
        status: values.status,
        username: values.username,
        gender: values.gender || undefined,
        birthday: values.birthday,
        profilePicture: values.profilePicture,
        profileBackground: values.profileBackground,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    toast.success(
      t("users.toasts.created", { name: `${values.firstName} ${values.lastName}`.trim() })
    );
  }

  // ── Active tab columns ────────────────────────────────────────────────────
  const activeColumns: ColumnDef<User>[] = [
    {
      key: "firstName",
      header: t("users.columns.nameCompany"),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor(fullName(row))}`}
          >
            {fullName(row)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{fullName(row)}</p>
            {row.username && <p className="text-xs text-muted-foreground">@{row.username}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("users.columns.userType"),
      sortable: true,
      render: (v) => (
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleBadge[v as User["role"]]}`}
        >
          {t(`common.status.${v as string}`)}
        </span>
      ),
    },
    {
      key: "phone",
      header: t("users.columns.phone"),
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {v as string}
        </span>
      ),
    },
    {
      key: "email",
      header: t("users.columns.email"),
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="w-3.5 h-3.5 shrink-0" />
          {(v as string) || "—"}
        </span>
      ),
    },
    { key: "createdAt", header: t("users.columns.registrationDate"), sortable: true },
    {
      key: "status",
      header: t("users.columns.status"),
      sortable: true,
      render: (v) => {
        const s = statusStyle[v as User["status"]];

        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
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
          onSuspend={setSuspendTarget}
          onDelete={setDeleteTarget}
        />
      ),
    },
  ];

  // ── Deleted tab columns ───────────────────────────────────────────────────
  const deletedColumns: ColumnDef<User>[] = [
    {
      key: "firstName",
      header: t("users.columns.user"),
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 opacity-60 ${avatarColor(fullName(row))}`}
          >
            {fullName(row)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate line-through text-muted-foreground">
              {fullName(row)}
            </p>
            {row.username && <p className="text-xs text-muted-foreground">@{row.username}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: t("users.columns.email"),
      render: (v) => (
        <span className="text-sm text-muted-foreground line-through">{(v as string) || "—"}</span>
      ),
    },
    {
      key: "role",
      header: t("users.columns.role"),
      render: (v) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
    {
      key: "deletedAt",
      header: t("users.columns.deletedAt"),
      sortable: true,
      render: (v) => <span className="text-sm text-muted-foreground">{v as string}</span>,
    },
    {
      key: "id",
      header: t("users.columns.actions"),
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-3">
          <button
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            onClick={() => restore(row)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("users.actions.restore")}
          </button>
          <button
            className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            onClick={() => setHardDeleteTarget(row)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("users.actions.hardDelete")}
          </button>
        </div>
      ),
    },
  ];

  const isSuspended = suspendTarget?.status === "suspended";

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("users.topbarTitle")}>
      {/* Tabs */}
      <div className="inline-flex items-center gap-1 bg-card border rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setTab("active")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            tab === "active"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          {t("users.tabs.active")}
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-bold",
              tab === "active" ? "bg-white/20" : "bg-muted text-muted-foreground"
            )}
          >
            {activeUsers.length}
          </span>
        </button>
        <button
          onClick={() => setTab("deleted")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            tab === "deleted"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserMinus className="w-4 h-4" />
          {t("users.tabs.deleted")}
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-bold",
              tab === "deleted" ? "bg-white/20" : "bg-muted text-muted-foreground"
            )}
          >
            {deletedUsers.length}
          </span>
        </button>
      </div>

      {tab === "active" ? (
        <DataTable<User>
          title={t("users.title")}
          description={t("users.description")}
          data={activeUsers}
          columns={activeColumns}
          rowKey="id"
          searchable
          searchPlaceholder={t("users.searchPlaceholder")}
          searchKeys={["firstName", "lastName", "email"]}
          filters={[
            {
              key: "role",
              label: t("users.filterUserType"),
              options: [
                { label: t("common.status.user"), value: "user" },
                { label: t("common.status.vendor"), value: "vendor" },
                { label: t("common.status.admin"), value: "admin" },
              ],
            },
            {
              key: "status",
              label: t("users.filterStatus"),
              options: [
                { label: t("common.status.active"), value: "active" },
                { label: t("common.status.suspended"), value: "suspended" },
                { label: t("common.status.inactive"), value: "inactive" },
              ],
            },
          ]}
          selectable
          toolbarActions={[
            {
              label: t("common.actions.suspendSelected"),
              icon: ShieldOff,
              variant: "destructive",
              requiresSelection: true,
              onClick: (rows) => {
                const ids = new Set(rows.map((r) => r.id));
                setUserList((prev) =>
                  prev.map((u) => (ids.has(u.id) ? { ...u, status: "suspended" } : u))
                );
                toast.success(t("users.toasts.suspendedSelected", { count: rows.length }));
              },
            },
            {
              label: t("users.addUser"),
              icon: UserPlus,
              variant: "default",
              requiresSelection: false,
              onClick: () => setAddDialogOpen(true),
            },
          ]}
          pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
          defaultSort={{ key: "createdAt", direction: "desc" }}
          striped
          stats={[
            {
              title: t("users.stats.total"),
              value: activeUsers.length,
              icon: Users,
              variant: "primary",
              trend: { value: 8.1, label: t("users.stats.thisMonth") },
            },
            {
              title: t("users.stats.active"),
              value: active,
              icon: UserCheck,
              variant: "success",
              trend: { value: 3.4, label: t("users.stats.vsLastMonth") },
            },
            {
              title: t("users.stats.suspended"),
              value: suspended,
              icon: UserX,
              variant: "danger",
              trend: { value: suspended, label: t("users.stats.accounts"), positiveIsGood: false },
            },
            {
              title: t("users.stats.pending"),
              value: inactive,
              icon: UserPlus,
              variant: "warning",
            },
          ]}
          emptyState={{ title: t("users.emptyTitle"), description: t("users.emptyDescription") }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{t("users.deleted.warningBanner")}</p>
          </div>
          <DataTable<User>
            title={t("users.deleted.title")}
            description={t("users.deleted.description")}
            data={deletedUsers}
            columns={deletedColumns}
            rowKey="id"
            searchable
            searchPlaceholder={t("users.deleted.searchPlaceholder")}
            searchKeys={["firstName", "lastName", "email"]}
            pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
            defaultSort={{ key: "deletedAt", direction: "desc" }}
            striped
            emptyState={{
              title: t("users.deleted.emptyTitle"),
              description: t("users.deleted.emptyDescription"),
            }}
          />
        </div>
      )}

      {/* Modals */}
      <UserViewDialog
        open={!!viewTarget}
        onOpenChange={(o) => {
          if (!o) {
            setViewTarget(null);
          }
        }}
        user={viewTarget}
      />
      <UserFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        user={null}
        onSubmit={handleFormSubmit}
      />
      <UserFormDialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) {
            setEditTarget(null);
          }
        }}
        user={editTarget}
        onSubmit={handleFormSubmit}
      />
      <UserPasswordDialog
        open={!!passwordTarget}
        onOpenChange={(o) => {
          if (!o) {
            setPasswordTarget(null);
          }
        }}
        user={passwordTarget}
        onSubmit={handlePasswordChange}
      />

      {/* Suspend confirm */}
      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(o) => {
          if (!o) {
            setSuspendTarget(null);
          }
        }}
        title={isSuspended ? t("users.confirm.activateTitle") : t("users.confirm.suspendTitle")}
        description={
          isSuspended
            ? t("users.confirm.activateDesc", {
                name: suspendTarget ? fullName(suspendTarget) : "",
              })
            : t("users.confirm.suspendDesc", { name: suspendTarget ? fullName(suspendTarget) : "" })
        }
        confirmLabel={isSuspended ? t("common.actions.activate") : t("common.actions.suspend")}
        variant={isSuspended ? "default" : "destructive"}
        onConfirm={() => {
          if (suspendTarget) {
            handleSuspendConfirm(suspendTarget);
          }

          setSuspendTarget(null);
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteTarget(null);
          }
        }}
        title={t("users.confirm.deleteTitle")}
        description={t("users.confirm.deleteDesc", {
          name: deleteTarget ? fullName(deleteTarget) : "",
        })}
        confirmLabel={t("users.actions.delete")}
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            softDelete(deleteTarget);
          }

          setDeleteTarget(null);
        }}
      />

      {/* Hard delete confirm */}
      <ConfirmDialog
        open={!!hardDeleteTarget}
        onOpenChange={(o) => {
          if (!o) {
            setHardDeleteTarget(null);
          }
        }}
        title={t("users.deleted.confirmTitle")}
        description={t("users.deleted.confirmDescription", {
          name: hardDeleteTarget ? fullName(hardDeleteTarget) : "",
        })}
        confirmLabel={t("users.deleted.confirmLabel")}
        variant="destructive"
        onConfirm={() => {
          if (hardDeleteTarget) {
            hardDelete(hardDeleteTarget);
          }

          setHardDeleteTarget(null);
        }}
      />
    </DashboardLayout>
  );
}
