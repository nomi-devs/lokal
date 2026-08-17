/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Filter,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import Chart from "@/components/ui/Chart";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import StatsCard from "@/components/ui/StatsCard";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/constants";

// ── Stats ──────────────────────────────────────────────────────────────────────
const stats = [
  {
    title: "Total Revenue",
    value: "48,295",
    prefix: "$",
    icon: DollarSign,
    variant: "success" as const,
    trend: { value: 12.5, label: "vs last month" },
  },
  {
    title: "Active Users",
    value: "3,842",
    icon: Users,
    variant: "primary" as const,
    trend: { value: 8.1, label: "vs last month" },
  },
  {
    title: "New Orders",
    value: "1,257",
    icon: ShoppingCart,
    variant: "warning" as const,
    trend: { value: -3.2, label: "vs last month" },
  },
  {
    title: "Growth Rate",
    value: "24.6",
    suffix: "%",
    icon: TrendingUp,
    variant: "info" as const,
    trend: { value: 4.3, label: "vs last month" },
  },
];

// ── Revenue Chart ──────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const REVENUE_TABS = ["Revenue Overview", "Total Projects", "Operating Status"];

const REVENUE_DATA: Record<string, { thisYear: number[]; lastYear: number[] }> = {
  "Revenue Overview": {
    thisYear: [11000, 6000, 7000, 10000, 15000, 14000, 25000, 29000, 22000, 23000, 17000, 23000],
    lastYear: [5000, 13000, 13000, 13000, 21000, 7000, 7000, 13000, 12000, 24000, 19000, 28000],
  },
  "Total Projects": {
    thisYear: [12, 8, 15, 22, 18, 25, 30, 28, 32, 27, 35, 40],
    lastYear: [10, 12, 10, 18, 20, 19, 24, 26, 28, 30, 32, 38],
  },
  "Operating Status": {
    thisYear: [85, 72, 90, 88, 75, 92, 87, 94, 89, 91, 86, 93],
    lastYear: [78, 80, 85, 82, 70, 88, 84, 90, 86, 88, 82, 89],
  },
};

const revenueOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#9ca3af" },
    },
    y: {
      border: { display: false, dash: [4, 4] },
      grid: { color: "rgba(156,163,175,0.15)" },
      ticks: {
        color: "#9ca3af",
        callback: (v: number) => (v >= 1000 ? `${v / 1000}K` : v),
      },
    },
  },
};

// ── Top Categories ─────────────────────────────────────────────────────────────
const TOP_CATEGORIES = [
  { name: "Construction", value: 15600 },
  { name: "Design", value: 13200 },
  { name: "Plumbing", value: 10800 },
  { name: "Electricity", value: 8400 },
  { name: "Landscaping", value: 6000 },
  { name: "Painting", value: 4800 },
  { name: "HVAC", value: 3600 },
];

const MAX_CATEGORY = TOP_CATEGORIES[0].value;

// ── Doughnut Chart ─────────────────────────────────────────────────────────────
const DOUGHNUT_SEGMENTS = [
  { label: "Active", value: 32981, color: "#2d4059" },
  { label: "Completed", value: 18543, color: "#b5956a" },
  { label: "Draft", value: 9876, color: "#86efac" },
  { label: "Cancelled", value: 4732, color: "#f87171" },
];

const doughnutData: any = {
  labels: DOUGHNUT_SEGMENTS.map((s) => s.label),
  datasets: [
    {
      data: DOUGHNUT_SEGMENTS.map((s) => s.value),
      backgroundColor: DOUGHNUT_SEGMENTS.map((s) => s.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: { display: false },
  },
};

// ── Organizations Chart ────────────────────────────────────────────────────────
const crosshairPlugin: any = {
  id: "crosshair",
  afterDraw(chart: any) {
    if (!chart.tooltip?._active?.length) {
      return;
    }

    const ctx = chart.ctx;
    const x = chart.tooltip._active[0].element.x;
    const topY = chart.scales.y.top;
    const bottomY = chart.scales.y.bottom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1.5;

    const grad = ctx.createLinearGradient(0, bottomY, 0, topY);

    grad.addColorStop(0, "rgba(124,58,237,0)");
    grad.addColorStop(1, "rgba(56,189,248,0.85)");
    ctx.strokeStyle = grad;
    ctx.stroke();
    ctx.restore();
  },
};

const orgsData: any = {
  labels: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  datasets: [
    {
      label: "Organizations",
      data: [42, 55, 33, 70, 65, 58, 64],
      borderColor: "#38bdf8",
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          return "transparent";
        }

        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

        gradient.addColorStop(0, "rgba(56,189,248,0.35)");
        gradient.addColorStop(1, "rgba(56,189,248,0)");

        return gradient;
      },
      fill: true,
      tension: 0.45,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#7c3aed",
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    },
  ],
};

const orgsOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (item: any) => String(item.raw),
        title: () => "",
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#9ca3af" },
    },
    y: {
      min: 0,
      max: 100,
      border: { display: false },
      grid: {
        color: "rgba(156,163,175,0.2)",
        lineWidth: 1,
        // dashed grid lines
        borderDash: [4, 4],
      },
      ticks: { color: "#9ca3af", stepSize: 20 },
    },
  },
};

// ── Table data ─────────────────────────────────────────────────────────────────
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
};

const users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    joined: "2024-01-15",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Active",
    joined: "2024-02-20",
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol@example.com",
    role: "Editor",
    status: "Inactive",
    joined: "2024-03-05",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@example.com",
    role: "User",
    status: "Active",
    joined: "2024-03-18",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "Admin",
    status: "Active",
    joined: "2024-04-02",
  },
  {
    id: 6,
    name: "Frank Lee",
    email: "frank@example.com",
    role: "User",
    status: "Pending",
    joined: "2024-04-10",
  },
  {
    id: 7,
    name: "Grace Kim",
    email: "grace@example.com",
    role: "Editor",
    status: "Active",
    joined: "2024-05-01",
  },
  {
    id: 8,
    name: "Henry Davis",
    email: "henry@example.com",
    role: "User",
    status: "Inactive",
    joined: "2024-05-14",
  },
  {
    id: 9,
    name: "Isla Wilson",
    email: "isla@example.com",
    role: "User",
    status: "Active",
    joined: "2024-06-03",
  },
  {
    id: 10,
    name: "Jack Taylor",
    email: "jack@example.com",
    role: "Admin",
    status: "Active",
    joined: "2024-06-20",
  },
  {
    id: 11,
    name: "Karen Moore",
    email: "karen@example.com",
    role: "Editor",
    status: "Active",
    joined: "2024-07-08",
  },
  {
    id: 12,
    name: "Leo Anderson",
    email: "leo@example.com",
    role: "User",
    status: "Pending",
    joined: "2024-07-22",
  },
];

const statusBadge: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Inactive: "bg-muted text-muted-foreground",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const columns: ColumnDef<User>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", sortable: true },
  { key: "role", header: "Role", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (v) => (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[v as string] ?? ""}`}
      >
        {v as string}
      </span>
    ),
  },
  { key: "joined", header: "Joined", sortable: true },
];

const rowActions: RowAction<User>[] = [
  { label: "View", icon: Eye, onClick: (r) => alert(`View ${r.name}`) },
  { label: "Edit", icon: Pencil, onClick: (r) => alert(`Edit ${r.name}`) },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (r) => alert(`Delete ${r.name}`),
    variant: "destructive",
  },
];

const toolbarActions: ToolbarAction<User>[] = [
  {
    label: "Delete selected",
    icon: Trash2,
    variant: "destructive",
    requiresSelection: true,
    onClick: (rows) => alert(`Delete ${rows.length} users`),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Revenue Overview");
  const tabData = REVENUE_DATA[activeTab];

  const revenueChartData: any = {
    labels: MONTHS,
    datasets: [
      {
        label: "This year",
        data: tabData.thisYear,
        borderColor: "#374151",
        backgroundColor: "rgba(156,163,175,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: "Last year",
        data: tabData.lastYear,
        borderColor: "#b5956a",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      },
    ],
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="Overview">
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-card rounded-xl border p-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-1 flex-wrap">
              {REVENUE_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                    activeTab === tab
                      ? "bg-[#1e2d3d] text-white dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
              <span className="mx-2 h-5 w-px bg-border" />
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#374151] inline-block" />
                  This year
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b5956a] inline-block" />
                  Last year
                </span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
          {/* Chart */}
          <div className="h-72">
            <Chart type="line" data={revenueChartData} options={revenueOptions} />
          </div>
        </div>

        {/* Top Categories + Doughnut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Categories by Revenue */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-5">Top Categories by Revenue</h2>
            <div className="flex flex-col gap-3">
              {TOP_CATEGORIES.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#1e2d3d] text-white text-xs font-bold flex items-center justify-center shrink-0 dark:bg-primary dark:text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {cat.value.toLocaleString()} KWD
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1e2d3d] dark:bg-primary rounded-full"
                      style={{ width: `${(cat.value / MAX_CATEGORY) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-5">Project Status Distribution</h2>
            <div className="flex items-center gap-6 h-64">
              <div className="flex-1 h-full">
                <Chart type="doughnut" data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex flex-col gap-4 shrink-0">
                {DOUGHNUT_SEGMENTS.map((seg) => (
                  <div key={seg.label} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-sm text-muted-foreground">{seg.label}</span>
                    </div>
                    <span className="text-sm font-bold pl-4">{seg.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Created */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-5">Organizations Created</h2>
          <div className="h-72">
            <Chart type="line" data={orgsData} options={orgsOptions} plugins={[crosshairPlugin]} />
          </div>
        </div>

        {/* Users Table */}
        <DataTable<User>
          title="Users"
          description="Manage your team members and their access."
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
                { label: "Inactive", value: "Inactive" },
                { label: "Pending", value: "Pending" },
              ],
            },
          ]}
          selectable
          rowActions={rowActions}
          toolbarActions={toolbarActions}
          pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 12] }}
          striped
          emptyState={{
            title: "No users found",
            description: "Try adjusting your search or filters.",
          }}
        />
      </div>
    </DashboardLayout>
  );
}
