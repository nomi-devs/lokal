import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, UserCheck, Store, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import StatsCard from "@/components/ui/StatsCard";
import { sidebarItems } from "@/constants";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/lib/adminApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";

// ── Page ───────────────────────────────────────────────────────────────────────
// Backed entirely by GET /admin/dashboard/stats — there's no analytics/revenue
// module in local-be yet, so the revenue/orders/customer-growth charts the
// template used to show here (built from mock data) were dropped rather than
// left displaying numbers with no real source behind them.
export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await getAdminDashboardStats());
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load dashboard stats"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      title: t("dashboard.stats.totalUsers", "Total Users"),
      value: stats?.totalUsers ?? 0,
      icon: Users,
      variant: "primary" as const,
    },
    {
      title: t("dashboard.stats.activeUsers", "Active Users"),
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      variant: "success" as const,
    },
    {
      title: t("dashboard.stats.totalVendors", "Total Vendors"),
      value: stats?.totalVendors ?? 0,
      icon: Store,
      variant: "info" as const,
    },
    {
      title: t("dashboard.stats.activeVendors", "Active Vendors"),
      value: stats?.activeVendors ?? 0,
      icon: ShieldCheck,
      variant: "success" as const,
    },
    {
      title: t("dashboard.stats.pendingApprovals", "Pending Approvals"),
      value: stats?.pendingApprovals ?? 0,
      icon: ShieldQuestion,
      variant: "warning" as const,
    },
    {
      title: t("dashboard.stats.suspendedVendors", "Suspended Vendors"),
      value: stats?.suspendedVendors ?? 0,
      icon: ShieldAlert,
      variant: "danger" as const,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("dashboard.topbarTitle")}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((s) => (
            <StatsCard key={s.title} {...s} loading={loading} />
          ))}
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-bold text-base mb-1">
            {t("dashboard.newRegistrations.title", "New Registrations")}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t("dashboard.newRegistrations.description", "New users, by registration window")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title={t("dashboard.newRegistrations.today", "Today")}
              value={stats?.registrations.today ?? 0}
              variant="default"
              loading={loading}
            />
            <StatsCard
              title={t("dashboard.newRegistrations.thisWeek", "This Week")}
              value={stats?.registrations.this_week ?? 0}
              variant="default"
              loading={loading}
            />
            <StatsCard
              title={t("dashboard.newRegistrations.thisMonth", "This Month")}
              value={stats?.registrations.this_month ?? 0}
              variant="default"
              loading={loading}
            />
          </div>
        </div>

        <StatsCard
          title={t("dashboard.newVendorApplications", "New Vendor Applications Today")}
          value={stats?.newVendorApplications ?? 0}
          icon={Store}
          variant="info"
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
}
