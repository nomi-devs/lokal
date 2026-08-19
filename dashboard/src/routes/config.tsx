// /routers/config.tsx
import type { ReactElement } from "react";

import RoleHomeRedirect from "./RoleHomeRedirect";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import BannersPage from "@/pages/BannersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import ProductsPage from "@/pages/ProductsPage";
import SettingsPage from "@/pages/SettingsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import VendorsPage from "@/pages/VendorsPage";
import KycVerificationPage from "@/pages/KycVerificationPage";
import OrdersPage from "@/pages/OrdersPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReviewsPage from "@/pages/ReviewsPage";
import PromoCodesPage from "@/pages/PromoCodesPage";
import RefundsPage from "@/pages/RefundsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SendNotificationsPage from "@/pages/NotificationsPage/Send";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorOrders from "@/pages/vendor/VendorOrders";
import VendorStore from "@/pages/vendor/VendorStore";
import VendorEarnings from "@/pages/vendor/VendorEarnings";
import VendorNotifications from "@/pages/vendor/VendorNotifications";

export interface AppRoute {
  path: string;
  element: ReactElement;
  protected?: boolean;
  publicOnly?: boolean;
  /** Restricts a protected route to a single role; mismatched roles are redirected to their own home. */
  role?: "admin" | "vendor";
}

export const routes: AppRoute[] = [
  { path: "/", element: <RoleHomeRedirect /> },
  { path: "/login", element: <Login />, publicOnly: true },
  { path: "/register", element: <Register />, publicOnly: true },
  { path: "/forgot-password", element: <ForgotPassword />, publicOnly: true },

  // ── Admin ──────────────────────────────────────────────────────────────────
  { path: "/admin/overview", element: <Dashboard />, protected: true, role: "admin" },
  { path: "/admin/banners", element: <BannersPage />, protected: true, role: "admin" },
  { path: "/admin/categories", element: <CategoriesPage />, protected: true, role: "admin" },
  { path: "/admin/products", element: <ProductsPage />, protected: true, role: "admin" },
  { path: "/admin/users", element: <UserManagementPage />, protected: true, role: "admin" },
  { path: "/admin/vendors", element: <VendorsPage />, protected: true, role: "admin" },
  {
    path: "/admin/kyc-verification",
    element: <KycVerificationPage />,
    protected: true,
    role: "admin",
  },
  { path: "/admin/orders", element: <OrdersPage />, protected: true, role: "admin" },
  { path: "/admin/payments", element: <PaymentsPage />, protected: true, role: "admin" },
  { path: "/admin/reviews", element: <ReviewsPage />, protected: true, role: "admin" },
  { path: "/admin/promo-codes", element: <PromoCodesPage />, protected: true, role: "admin" },
  { path: "/admin/refunds", element: <RefundsPage />, protected: true, role: "admin" },
  {
    path: "/admin/notifications",
    element: <NotificationsPage />,
    protected: true,
    role: "admin",
  },
  {
    path: "/admin/notifications/send",
    element: <SendNotificationsPage />,
    protected: true,
    role: "admin",
  },
  { path: "/admin/settings", element: <SettingsPage />, protected: true, role: "admin" },

  // ── Vendor ─────────────────────────────────────────────────────────────────
  { path: "/vendor/dashboard", element: <VendorDashboard />, protected: true, role: "vendor" },
  { path: "/vendor/products", element: <VendorProducts />, protected: true, role: "vendor" },
  { path: "/vendor/orders", element: <VendorOrders />, protected: true, role: "vendor" },
  {
    path: "/vendor/notifications",
    element: <VendorNotifications />,
    protected: true,
    role: "vendor",
  },
  { path: "/vendor/store", element: <VendorStore />, protected: true, role: "vendor" },
  { path: "/vendor/earnings", element: <VendorEarnings />, protected: true, role: "vendor" },
];
