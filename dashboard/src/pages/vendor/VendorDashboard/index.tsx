import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Package, DollarSign, Clock, TrendingUp, Star } from "lucide-react";
import type { ChartData, ChartOptions } from "chart.js";

import { getVendorOrders } from "../utils";

import { DashboardLayout } from "@/components/Dashboard";
import Chart from "@/components/ui/Chart";
import StatsCard from "@/components/ui/StatsCard";
import { vendorSidebarItems } from "@/constants";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { products } from "@/data/products";
import { users } from "@/data/users";
import type { OrderStatus } from "@/data/orders";

const userById = new Map(users.map((u) => [u.id, u]));

const customerName = (userId: number) => {
  const u = userById.get(userId);

  return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
};

const statusStyle: Record<string, { text: string; bg: string; dot: string }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    dot: "bg-sky-500",
  },
  preparing: {
    text: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    dot: "bg-indigo-500",
  },
  ready_for_pickup: {
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    dot: "bg-fuchsia-500",
  },
  in_transit: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    dot: "bg-violet-500",
  },
  delivered: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  cancelled: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#6366f1",
  ready_for_pickup: "#d946ef",
  in_transit: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function VendorDashboard() {
  const { t } = useTranslation();
  const vendorId = useSelector((state: RootState) => state.auth.user?.vendorId ?? 0);

  const vendorProducts = products.filter((p) => p.vendorId === vendorId);
  const rows = getVendorOrders(vendorId);

  const totalRevenue = rows
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingOrders = rows.filter((r) => r.status === "pending").length;
  const avgOrderValue = rows.length ? totalRevenue / rows.length : 0;

  const recentOrders = [...rows]
    .sort((a, b) => (a.order.createdAt < b.order.createdAt ? 1 : -1))
    .slice(0, 5);

  const topProducts = [...vendorProducts]
    .sort((a, b) => b.ratings.count - a.ratings.count)
    .slice(0, 5);

  const statusCounts = (
    [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "in_transit",
      "delivered",
      "cancelled",
    ] as const
  ).map((status) => ({
    status,
    count: rows.filter((r) => r.status === status).length,
  }));

  const revenueChartData: ChartData<"bar"> = {
    labels: rows.map((r) => r.order.orderNumber.replace("ORD-2026-", "#")),
    datasets: [
      {
        label: t("vendor.dashboard.revenueChart.title"),
        data: rows.map((r) => r.amount),
        backgroundColor: "#4a9b8e",
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const revenueChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: {
        border: { display: false },
        grid: { color: "rgba(156,163,175,0.15)" },
        ticks: { callback: (v) => `${v} KWD` },
      },
    },
  };

  const doughnutData: ChartData<"doughnut"> = {
    labels: statusCounts.map((s) => s.status),
    datasets: [
      {
        data: statusCounts.map((s) => s.count),
        backgroundColor: statusCounts.map((s) => STATUS_COLORS[s.status]),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: { legend: { display: false } },
  };

  const stats = [
    {
      title: t("vendor.dashboard.stats.totalOrders"),
      value: rows.length,
      icon: ShoppingCart,
      variant: "primary" as const,
    },
    {
      title: t("vendor.dashboard.stats.totalProducts"),
      value: vendorProducts.length,
      icon: Package,
      variant: "info" as const,
    },
    {
      title: t("vendor.dashboard.stats.totalRevenue"),
      value: totalRevenue.toLocaleString(),
      suffix: " KWD",
      icon: DollarSign,
      variant: "success" as const,
    },
    {
      title: t("vendor.dashboard.stats.pendingOrders"),
      value: pendingOrders,
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: t("vendor.dashboard.stats.avgOrderValue"),
      value: avgOrderValue.toFixed(1),
      suffix: " KWD",
      icon: TrendingUp,
      variant: "default" as const,
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.dashboard.topbarTitle")}
    >
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-1">{t("vendor.dashboard.revenueChart.title")}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t("vendor.dashboard.revenueChart.description")}
          </p>
          <div className="h-64">
            {rows.length > 0 ? (
              <Chart type="bar" data={revenueChartData} options={revenueChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                {t("vendor.dashboard.revenueChart.empty")}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orders by status */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-5">
              {t("vendor.dashboard.ordersByStatus.title")}
            </h2>
            <div className="flex items-center gap-6 h-56">
              <div className="flex-1 h-full">
                <Chart type="doughnut" data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                {statusCounts.map((s) => (
                  <div key={s.status} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[s.status] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {t(`common.status.${s.status}`, s.status)}
                      </span>
                    </div>
                    <span className="text-sm font-bold pl-4">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-bold text-base mb-1">{t("vendor.dashboard.recentOrders.title")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("vendor.dashboard.recentOrders.description")}
            </p>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {t("vendor.dashboard.recentOrders.empty")}
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {recentOrders.map((r) => (
                  <div key={r.order.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customerName(r.order.userId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                          statusStyle[r.status].text,
                          statusStyle[r.status].bg
                        )}
                      >
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full", statusStyle[r.status].dot)}
                        />
                        {t(`common.status.${r.status}`, r.status)}
                      </span>
                      <span className="text-sm font-semibold w-20 text-right">
                        {r.amount.toLocaleString()} KWD
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-1">{t("vendor.dashboard.topProducts.title")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("vendor.dashboard.topProducts.description")}
          </p>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {t("vendor.dashboard.topProducts.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 gap-3 border-b">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.images[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.nameEn}
                        className="w-9 h-9 rounded-md object-cover border shrink-0"
                      />
                    )}
                    <p className="text-sm font-medium truncate">{p.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.ratings.average.toFixed(1)} ({p.ratings.count})
                    </span>
                    <span className="text-sm font-semibold w-20 text-right">
                      {p.price.base} {p.price.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
