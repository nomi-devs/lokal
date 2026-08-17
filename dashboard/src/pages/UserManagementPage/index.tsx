import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Pencil,
  Trash2,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";

// ── Types ─────────────────────────────────────────────────────────────────────
type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "User";
  status: "Active" | "Suspended" | "Pending";
  joined: string;
  lastSeen: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    joined: "2023-01-10",
    lastSeen: "2 min ago",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Active",
    joined: "2023-02-14",
    lastSeen: "1 hr ago",
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol@example.com",
    role: "Editor",
    status: "Suspended",
    joined: "2023-03-05",
    lastSeen: "3 days ago",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@example.com",
    role: "User",
    status: "Active",
    joined: "2023-03-18",
    lastSeen: "5 min ago",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "Admin",
    status: "Active",
    joined: "2023-04-02",
    lastSeen: "Just now",
  },
  {
    id: 6,
    name: "Frank Lee",
    email: "frank@example.com",
    role: "User",
    status: "Pending",
    joined: "2023-04-10",
    lastSeen: "Never",
  },
  {
    id: 7,
    name: "Grace Kim",
    email: "grace@example.com",
    role: "Editor",
    status: "Active",
    joined: "2023-05-01",
    lastSeen: "20 min ago",
  },
  {
    id: 8,
    name: "Henry Davis",
    email: "henry@example.com",
    role: "User",
    status: "Suspended",
    joined: "2023-05-14",
    lastSeen: "2 weeks ago",
  },
  {
    id: 9,
    name: "Isla Wilson",
    email: "isla@example.com",
    role: "User",
    status: "Active",
    joined: "2023-06-03",
    lastSeen: "1 day ago",
  },
  {
    id: 10,
    name: "Jack Taylor",
    email: "jack@example.com",
    role: "Admin",
    status: "Active",
    joined: "2023-06-20",
    lastSeen: "3 hr ago",
  },
  {
    id: 11,
    name: "Karen Moore",
    email: "karen@example.com",
    role: "Editor",
    status: "Active",
    joined: "2023-07-08",
    lastSeen: "30 min ago",
  },
  {
    id: 12,
    name: "Leo Anderson",
    email: "leo@example.com",
    role: "User",
    status: "Pending",
    joined: "2023-07-22",
    lastSeen: "Never",
  },
  {
    id: 13,
    name: "Mia Thomas",
    email: "mia@example.com",
    role: "User",
    status: "Active",
    joined: "2023-08-05",
    lastSeen: "2 hr ago",
  },
  {
    id: 14,
    name: "Noah Garcia",
    email: "noah@example.com",
    role: "Editor",
    status: "Suspended",
    joined: "2023-08-19",
    lastSeen: "1 month ago",
  },
  {
    id: 15,
    name: "Olivia Harris",
    email: "olivia@example.com",
    role: "User",
    status: "Active",
    joined: "2023-09-01",
    lastSeen: "15 min ago",
  },
];

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<User["status"], { text: string; bg: string; dot: string }> = {
  Active: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  Suspended: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
  Pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
};

const roleStyle: Record<User["role"], string> = {
  Admin: "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/30",
  Editor: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  User: "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
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

// ── Columns ───────────────────────────────────────────────────────────────────
const columns: ColumnDef<User>[] = [
  {
    key: "name",
    header: "User",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor(row.name)}`}
        >
          {row.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    render: (v) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle[v as User["role"]]}`}
      >
        {v as string}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (v) => {
      const s = statusStyle[v as User["status"]];

      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {v as string}
        </span>
      );
    },
  },
  { key: "joined", header: "Joined", sortable: true },
  { key: "lastSeen", header: "Last Seen", sortable: true },
];

// ── Actions ───────────────────────────────────────────────────────────────────
const rowActions: RowAction<User>[] = [
  { label: "Edit", icon: Pencil, onClick: (r) => alert(`Edit: ${r.name}`) },
  {
    label: "Suspend",
    icon: ShieldOff,
    onClick: (r) => alert(`Suspend: ${r.name}`),
    hidden: (r) => r.status === "Suspended",
    variant: "destructive",
  },
  {
    label: "Activate",
    icon: ShieldCheck,
    onClick: (r) => alert(`Activate: ${r.name}`),
    hidden: (r) => r.status === "Active",
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (r) => alert(`Delete: ${r.name}`),
    variant: "destructive",
  },
];

const toolbarActions: ToolbarAction<User>[] = [
  {
    label: "Suspend selected",
    icon: ShieldOff,
    variant: "destructive",
    requiresSelection: true,
    onClick: (rows) => alert(`Suspend ${rows.length} users`),
  },
  {
    label: "Add User",
    icon: UserPlus,
    variant: "default",
    requiresSelection: false,
    onClick: () => alert("Open add user form"),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const active = users.filter((u) => u.status === "Active").length;
const suspended = users.filter((u) => u.status === "Suspended").length;
const pending = users.filter((u) => u.status === "Pending").length;

export default function UserManagementPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="User Management">
      <DataTable<User>
        title="All Users"
        description="Manage user accounts, roles, and access."
        data={users}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search by name or email…"
        searchKeys={["name", "email"]}
        filters={[
          {
            key: "role",
            label: "Role",
            options: [
              { label: "Admin", value: "Admin" },
              { label: "Editor", value: "Editor" },
              { label: "User", value: "User" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Active", value: "Active" },
              { label: "Suspended", value: "Suspended" },
              { label: "Pending", value: "Pending" },
            ],
          },
        ]}
        selectable
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
        defaultSort={{ key: "joined", direction: "desc" }}
        striped
        stats={[
          {
            title: "Total Users",
            value: users.length,
            icon: Users,
            variant: "primary",
            trend: { value: 8.1, label: "this month" },
          },
          {
            title: "Active",
            value: active,
            icon: UserCheck,
            variant: "success",
            trend: { value: 3.4, label: "vs last month" },
          },
          {
            title: "Suspended",
            value: suspended,
            icon: UserX,
            variant: "danger",
            trend: { value: suspended, label: "accounts", positiveIsGood: false },
          },
          { title: "Pending", value: pending, icon: UserPlus, variant: "warning" },
        ]}
        emptyState={{
          title: "No users found",
          description: "Try adjusting your search or filters.",
        }}
      />
    </DashboardLayout>
  );
}
