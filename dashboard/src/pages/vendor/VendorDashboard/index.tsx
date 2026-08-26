import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Package, DollarSign, Clock, TrendingUp, Star } from "lucide-react";
import type { ChartData, ChartOptions } from "chart.js";

import { DashboardLayout } from "@/components/Dashboard";
import Chart from "@/components/ui/Chart";
import StatsCard from "@/components/ui/StatsCard";
import { vendorSidebarItems } from "@/constants";
import { toast } from "@/components/ui/Toast";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/apiClient";
import { listVendorOrders, type Order, type OrderStatus } from "@/lib/ordersApi";
import { listMyProducts, type Product } from "@/lib/productsApi";

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  placed: "warning",
  confirmed: "info",
  in_transit: "purple",
  delivered: "success",
  cancelled: "danger",
};

// Chart.js needs literal hex, not Tailwind classes, so this can't reuse statusVariant directly.
const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: "#f59e0b",
  confirmed: "#3b82f6",
  in_transit: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const ALL_STATUSES: OrderStatus[] = ["placed", "confirmed", "in_transit", "delivered", "cancelled"];

export default function VendorDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([listVendorOrders(), listMyProducts()]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "placed").length;
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const recentOrders = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);

  const topProducts = [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5);

  const statusCounts = ALL_STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const revenueChartData: ChartData<"bar"> = {
    labels: orders.map((o) => o.orderNumber),
    datasets: [
      {
        label: t("vendor.dashboard.revenueChart.title"),
        data: orders.map((o) => o.total),
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
      value: orders.length,
      icon: ShoppingCart,
      variant: "primary" as const,
    },
    {
      title: t("vendor.dashboard.stats.totalProducts"),
      value: products.length,
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
            <StatsCard key={s.title} {...s} loading={loading} />
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-1">{t("vendor.dashboard.revenueChart.title")}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t("vendor.dashboard.revenueChart.description")}
          </p>
          <div className="h-64">
            {orders.length > 0 ? (
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
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {t("vendor.dashboard.recentOrders.empty")}
              </p>
            ) : (
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
            )}
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
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.addressSnapshot.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={statusVariant[o.status]} dot>
                        {t(`common.status.${o.status}`, o.status)}
                      </Badge>
                      <span className="text-sm font-semibold w-20 text-right">
                        {o.total.toLocaleString()} KWD
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
                        alt={p.name.en}
                        className="w-9 h-9 rounded-md object-cover border shrink-0"
                      />
                    )}
                    <p className="text-sm font-medium truncate">{p.name.en}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.rating.toFixed(1)} ({p.ratingCount})
                    </span>
                    <span className="text-sm font-semibold w-20 text-right">
                      {p.price.toLocaleString()} KWD
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
