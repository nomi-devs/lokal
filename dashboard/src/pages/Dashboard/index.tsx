import { useTranslation } from "react-i18next";
import { Users, ShoppingCart, DollarSign, TrendingUp, Star } from "lucide-react";
import type { ChartData, ChartOptions, ScriptableContext } from "chart.js";

import { DashboardLayout } from "@/components/Dashboard";
import Chart from "@/components/ui/Chart";
import StatsCard from "@/components/ui/StatsCard";
import { sidebarItems } from "@/constants";
import { useTheme } from "@/providers/ThemeProvider";
import { totalRevenue } from "@/data/orders";
import { topVendors } from "@/data/analytics";
import { dashboardTopCategories, dashboardStatusSegments } from "@/data/dashboardUsers";

// ── Shared axis styling ──────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const axisTicks = { color: "#9ca3af" };

// ── Revenue trend ──────────────────────────────────────────────────────────────
// Canvas colors can't read CSS custom properties, so mirror --primary per mode here.
function buildRevenueData(
  label: string,
  primaryColor: string,
  primaryTintStop: string
): ChartData<"line"> {
  return {
    labels: MONTHS,
    datasets: [
      {
        label,
        data: [18400, 21200, 19800, 24500, 27600, 26100, 31200, 34800, 32100, 36500, 39200, 42800],
        borderColor: primaryColor,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const { ctx, chartArea } = context.chart;

          if (!chartArea) {
            return "transparent";
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

          gradient.addColorStop(0, primaryTintStop);
          gradient.addColorStop(1, "rgba(74,101,128,0)");

          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
    ],
  };
}

const revenueOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: axisTicks },
    y: {
      border: { display: false },
      grid: { color: "rgba(156,163,175,0.15)" },
      ticks: {
        color: "#9ca3af",
        callback: (v) => (Number(v) >= 1000 ? `${Number(v) / 1000}K` : v),
      },
    },
  },
};

// ── Orders by status ─────────────────────────────────────────────────────────
function buildOrdersByStatusData(label: string): ChartData<"bar"> {
  return {
    labels: [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready for Pickup",
      "In Transit",
      "Delivered",
      "Cancelled",
    ],
    datasets: [
      {
        label,
        data: [42, 68, 51, 39, 55, 312, 18],
        backgroundColor: [
          "#f59e0b",
          "#3b82f6",
          "#6366f1",
          "#d946ef",
          "#8b5cf6",
          "#10b981",
          "#ef4444",
        ],
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };
}

const ordersByStatusOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: axisTicks },
    y: {
      border: { display: false },
      grid: { color: "rgba(156,163,175,0.15)" },
      ticks: axisTicks,
    },
  },
};

// ── Customer growth ───────────────────────────────────────────────────────────
function buildCustomerGrowthData(
  newLabel: string,
  returningLabel: string,
  primaryColor: string
): ChartData<"line"> {
  return {
    labels: MONTHS,
    datasets: [
      {
        label: newLabel,
        data: [120, 145, 132, 168, 190, 178, 210, 236, 224, 258, 271, 302],
        borderColor: "#4a9b8e",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
      {
        label: returningLabel,
        data: [80, 92, 88, 104, 118, 112, 130, 142, 138, 156, 164, 178],
        borderColor: primaryColor,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };
}

const customerGrowthOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: axisTicks },
    y: { border: { display: false }, grid: { color: "rgba(156,163,175,0.15)" }, ticks: axisTicks },
  },
};

const MAX_CATEGORY = dashboardTopCategories[0].value;
const MAX_VENDOR_REVENUE = topVendors[0].revenue;

const doughnutData: ChartData<"doughnut"> = {
  labels: dashboardStatusSegments.map((s) => s.key),
  datasets: [
    {
      data: dashboardStatusSegments.map((s) => s.value),
      backgroundColor: dashboardStatusSegments.map((s) => s.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: { display: false },
  },
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const primaryColor = theme === "dark" ? "#4a6580" : "#2c3e50";
  const primaryTintStop = theme === "dark" ? "rgba(74,101,128,0.3)" : "rgba(44,62,80,0.3)";
  const revenueData = buildRevenueData(t("orders.stats.revenue"), primaryColor, primaryTintStop);
  const ordersByStatusData = buildOrdersByStatusData(t("orders.stats.total"));

  const customerGrowthData = buildCustomerGrowthData(
    t("analytics.customerGrowth.new"),
    t("analytics.customerGrowth.returning"),
    primaryColor
  );

  const stats = [
    {
      title: t("dashboard.stats.totalRevenue"),
      value: totalRevenue.toLocaleString(),
      suffix: " KWD",
      icon: DollarSign,
      variant: "success" as const,
      trend: { value: 12.5, label: t("statsCard.vsLastMonth") },
    },
    {
      title: t("analytics.stats.totalOrders"),
      value: "495",
      icon: ShoppingCart,
      variant: "primary" as const,
      trend: { value: 6.2, label: t("statsCard.vsLastMonth") },
    },
    {
      title: t("analytics.stats.newCustomers"),
      value: "302",
      icon: Users,
      variant: "info" as const,
      trend: { value: 11.4, label: t("statsCard.vsLastMonth") },
    },
    {
      title: t("analytics.stats.avgOrderValue"),
      value: "86.5",
      prefix: "KWD ",
      icon: TrendingUp,
      variant: "warning" as const,
      trend: { value: -1.9, label: t("statsCard.vsLastMonth") },
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("dashboard.topbarTitle")}>
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Revenue trend */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-base">{t("analytics.revenueTrend.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("analytics.revenueTrend.description")}
              </p>
            </div>
          </div>
          <div className="h-72">
            <Chart type="line" data={revenueData} options={revenueOptions} />
          </div>
        </div>

        {/* Orders by status + Customer growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-1">{t("analytics.ordersByStatus.title")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("analytics.ordersByStatus.description")}
            </p>
            <div className="h-64">
              <Chart type="bar" data={ordersByStatusData} options={ordersByStatusOptions} />
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-base">{t("analytics.customerGrowth.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("analytics.customerGrowth.description")}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a9b8e] inline-block" />
                  {t("analytics.customerGrowth.new")}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  {t("analytics.customerGrowth.returning")}
                </span>
              </div>
            </div>
            <div className="h-64">
              <Chart type="line" data={customerGrowthData} options={customerGrowthOptions} />
            </div>
          </div>
        </div>

        {/* Top Categories + Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-5">{t("dashboard.topCategories.title")}</h2>
            <div className="flex flex-col gap-3">
              {dashboardTopCategories.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
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
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(cat.value / MAX_CATEGORY) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-5">{t("dashboard.statusDistribution.title")}</h2>
            <div className="flex items-center gap-6 h-64">
              <div className="flex-1 h-full">
                <Chart type="doughnut" data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex flex-col gap-4 shrink-0">
                {dashboardStatusSegments.map((seg) => (
                  <div key={seg.key} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {t(`dashboard.statusDistribution.${seg.key}`)}
                      </span>
                    </div>
                    <span className="text-sm font-bold pl-4">{seg.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top vendors */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-1">{t("analytics.topVendors.title")}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t("analytics.topVendors.description")}
          </p>
          <div className="flex flex-col gap-4">
            {topVendors.map((v, i) => (
              <div key={v.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{v.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {v.rating}
                    </span>
                    <span className="text-sm font-semibold w-24 text-right">
                      {v.revenue.toLocaleString()} KWD
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(v.revenue / MAX_VENDOR_REVENUE) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
