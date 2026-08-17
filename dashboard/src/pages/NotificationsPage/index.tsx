import { Bell, BellOff, AlertTriangle, CheckCheck, Trash2, Eye } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";

// ── Types ─────────────────────────────────────────────────────────────────────
type Notification = {
  id: number;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Alert" | "System";
  priority: "Normal" | "High" | "Critical";
  sentAt: string;
  read: boolean;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const notifications: Notification[] = [
  {
    id: 1,
    title: "Welcome to Dashboard Kit",
    message: "Your account has been set up successfully.",
    type: "System",
    priority: "Normal",
    sentAt: "2024-01-15 09:00",
    read: true,
  },
  {
    id: 2,
    title: "Security alert: new login",
    message: "A new login was detected from an unknown device.",
    type: "Alert",
    priority: "High",
    sentAt: "2024-01-16 14:22",
    read: false,
  },
  {
    id: 3,
    title: "Your plan renews in 3 days",
    message: "Please ensure your payment method is up to date.",
    type: "Warning",
    priority: "Normal",
    sentAt: "2024-01-17 08:00",
    read: false,
  },
  {
    id: 4,
    title: "System maintenance scheduled",
    message: "Scheduled downtime: Jan 20, 02:00–04:00 UTC.",
    type: "System",
    priority: "High",
    sentAt: "2024-01-18 10:00",
    read: true,
  },
  {
    id: 5,
    title: "New user registered",
    message: "John Doe just signed up for a free account.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-18 11:45",
    read: true,
  },
  {
    id: 6,
    title: "Critical: disk usage at 90%",
    message: "Storage is almost full. Please free up space.",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-19 06:30",
    read: false,
  },
  {
    id: 7,
    title: "Weekly report available",
    message: "Your analytics report for last week is ready.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-19 08:00",
    read: true,
  },
  {
    id: 8,
    title: "Password changed successfully",
    message: "Your account password was updated.",
    type: "System",
    priority: "Normal",
    sentAt: "2024-01-19 15:10",
    read: true,
  },
  {
    id: 9,
    title: "Failed payment attempt",
    message: "Payment of $49.00 failed. Update billing details.",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-20 09:00",
    read: false,
  },
  {
    id: 10,
    title: "Feature update: DataTable v2",
    message: "New filtering and sorting features are now live.",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-20 12:00",
    read: true,
  },
];

// ── Style maps ────────────────────────────────────────────────────────────────
const typeStyle: Record<Notification["type"], { text: string; bg: string }> = {
  Info: { text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30" },
  Warning: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Alert: { text: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/30" },
  System: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

const priorityStyle: Record<Notification["priority"], { text: string; dot: string }> = {
  Normal: { text: "text-muted-foreground", dot: "bg-slate-400" },
  High: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400" },
  Critical: { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

// ── Columns ───────────────────────────────────────────────────────────────────
const columns: ColumnDef<Notification>[] = [
  {
    key: "title",
    header: "Notification",
    sortable: true,
    render: (_, row) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={`text-sm truncate ${!row.read ? "font-semibold" : "font-medium"}`}>
          {!row.read && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 shrink-0" />
          )}
          {row.title}
        </span>
        <span className="text-xs text-muted-foreground truncate">{row.message}</span>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    sortable: true,
    render: (v) => {
      const s = typeStyle[v as Notification["type"]];

      return (
        <span
          className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
        >
          {v as string}
        </span>
      );
    },
  },
  {
    key: "priority",
    header: "Priority",
    sortable: true,
    render: (v) => {
      const s = priorityStyle[v as Notification["priority"]];

      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {v as string}
        </span>
      );
    },
  },
  { key: "sentAt", header: "Received", sortable: true },
  {
    key: "read",
    header: "Status",
    sortable: true,
    render: (v) =>
      v ? (
        <span className="text-xs text-muted-foreground">Read</span>
      ) : (
        <span className="text-xs font-semibold text-primary">Unread</span>
      ),
  },
];

const rowActions: RowAction<Notification>[] = [
  { label: "View", icon: Eye, onClick: (r) => alert(r.message) },
  {
    label: "Mark as read",
    icon: CheckCheck,
    onClick: (r) => alert(`Marked: ${r.title}`),
    hidden: (r) => r.read,
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (r) => alert(`Delete: ${r.title}`),
    variant: "destructive",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const unread = notifications.filter((n) => !n.read).length;
const high = notifications.filter((n) => n.priority === "High").length;
const critical = notifications.filter((n) => n.priority === "Critical").length;

export default function NotificationsPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="Notifications">
      <DataTable<Notification>
        title="Inbox"
        description="All notifications sent to your account."
        data={notifications}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search notifications…"
        searchKeys={["title", "message"]}
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { label: "Info", value: "Info" },
              { label: "Warning", value: "Warning" },
              { label: "Alert", value: "Alert" },
              { label: "System", value: "System" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            options: [
              { label: "Normal", value: "Normal" },
              { label: "High", value: "High" },
              { label: "Critical", value: "Critical" },
            ],
          },
          {
            key: "read",
            label: "Status",
            options: [
              { label: "Unread", value: "false" },
              { label: "Read", value: "true" },
            ],
          },
        ]}
        rowActions={rowActions}
        defaultSort={{ key: "sentAt", direction: "desc" }}
        pagination={{ pageSize: 8 }}
        stats={[
          { title: "Total", value: notifications.length, icon: Bell, variant: "primary" },
          {
            title: "Unread",
            value: unread,
            icon: BellOff,
            variant: "info",
            trend: { value: unread, label: "need attention" },
          },
          { title: "High", value: high, icon: AlertTriangle, variant: "warning" },
          {
            title: "Critical",
            value: critical,
            icon: AlertTriangle,
            variant: "danger",
            trend: { value: critical, label: "action required", positiveIsGood: false },
          },
        ]}
        emptyState={{ title: "No notifications", description: "You're all caught up." }}
      />
    </DashboardLayout>
  );
}
