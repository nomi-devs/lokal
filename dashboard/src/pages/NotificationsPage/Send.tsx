import { useState } from "react";
import { Send, Users, Bell, AlertTriangle } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────
type SentNotification = {
  id: number;
  title: string;
  recipients: string;
  type: string;
  priority: string;
  sentAt: string;
  delivered: number;
};

// ── Mock sent history ─────────────────────────────────────────────────────────
const sentHistory: SentNotification[] = [
  {
    id: 1,
    title: "System maintenance scheduled",
    recipients: "All Users",
    type: "System",
    priority: "High",
    sentAt: "2024-01-18 10:00",
    delivered: 1284,
  },
  {
    id: 2,
    title: "New feature: dark mode",
    recipients: "All Users",
    type: "Info",
    priority: "Normal",
    sentAt: "2024-01-17 09:00",
    delivered: 1284,
  },
  {
    id: 3,
    title: "Admin security briefing",
    recipients: "Admins",
    type: "Alert",
    priority: "High",
    sentAt: "2024-01-16 15:00",
    delivered: 12,
  },
  {
    id: 4,
    title: "Trial expiring soon",
    recipients: "Users",
    type: "Warning",
    priority: "Normal",
    sentAt: "2024-01-15 08:00",
    delivered: 843,
  },
  {
    id: 5,
    title: "Critical: storage alert",
    recipients: "Admins",
    type: "Alert",
    priority: "Critical",
    sentAt: "2024-01-14 06:00",
    delivered: 12,
  },
];

const typeStyle: Record<string, string> = {
  Info: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  Warning: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
  Alert: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
  System: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
};

const columns: ColumnDef<SentNotification>[] = [
  {
    key: "title",
    header: "Title",
    sortable: true,
    render: (v) => <span className="font-medium text-sm">{v as string}</span>,
  },
  { key: "recipients", header: "Recipients", sortable: true },
  {
    key: "type",
    header: "Type",
    sortable: true,
    render: (v) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyle[v as string] ?? ""}`}
      >
        {v as string}
      </span>
    ),
  },
  { key: "priority", header: "Priority", sortable: true },
  {
    key: "delivered",
    header: "Delivered",
    sortable: true,
    align: "right",
    render: (v) => <span className="font-semibold">{(v as number).toLocaleString()}</span>,
  },
  { key: "sentAt", header: "Sent At", sortable: true },
];

// ── Form ──────────────────────────────────────────────────────────────────────
const inputClass =
  "w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
const labelClass = "block text-sm font-medium mb-1.5";
const selectClass = `${inputClass} cursor-pointer`;

export default function SendNotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipients: "all",
    type: "Info",
    priority: "Normal",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ title: "", message: "", recipients: "all", type: "Info", priority: "Normal" });
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="Send Notification">
      <div className="flex flex-col gap-6">
        {/* Compose card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Compose Notification</CardTitle>
                <CardDescription>Send a notification to one or more user groups.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Notification title…"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} h-auto py-2.5 resize-none`}
                />
              </div>

              {/* Recipients */}
              <div>
                <label className={labelClass}>Recipients</label>
                <select
                  value={form.recipients}
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                  className={selectClass}
                >
                  <option value="all">All Users</option>
                  <option value="admins">Admins only</option>
                  <option value="users">Regular Users only</option>
                  <option value="editors">Editors only</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={selectClass}
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Alert">Alert</option>
                  <option value="System">System</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className={selectClass}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Submit */}
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Send Notification
                </button>
                {sent && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Notification sent successfully
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sent history */}
        <DataTable<SentNotification>
          title="Sent History"
          description="Previously sent notifications."
          data={sentHistory}
          columns={columns}
          rowKey="id"
          searchable
          searchPlaceholder="Search sent notifications…"
          searchKeys={["title", "recipients"]}
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
          ]}
          defaultSort={{ key: "sentAt", direction: "desc" }}
          pagination={{ pageSize: 5 }}
          stats={[
            { title: "Total Sent", value: sentHistory.length, icon: Bell, variant: "primary" },
            {
              title: "Total Delivered",
              value: sentHistory.reduce((s, n) => s + n.delivered, 0).toLocaleString(),
              icon: Users,
              variant: "success",
            },
            {
              title: "High Priority",
              value: sentHistory.filter((n) => n.priority === "High").length,
              icon: AlertTriangle,
              variant: "warning",
            },
            {
              title: "Critical Sent",
              value: sentHistory.filter((n) => n.priority === "Critical").length,
              icon: AlertTriangle,
              variant: "danger",
            },
          ]}
          emptyState={{ title: "No notifications sent yet" }}
        />
      </div>
    </DashboardLayout>
  );
}
