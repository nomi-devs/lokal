// /routers/config.tsx
import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/Dashboard/Dashboard";
import BannersPage from "@/pages/BannersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import ProductsPage from "@/pages/ProductsPage";
import SettingsPage from "@/pages/SettingsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import VendorsPage from "@/pages/VendorsPage";
import OrdersPage from "@/pages/OrdersPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReviewsPage from "@/pages/ReviewsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SendNotificationsPage from "@/pages/NotificationsPage/Send";

export interface AppRoute {
  path: string;
  element: ReactElement;
  protected?: boolean;
  publicOnly?: boolean;
}

export const routes: AppRoute[] = [
  { path: "/", element: <Navigate to="/overview" replace /> },
  { path: "/login", element: <Login />, publicOnly: true },
  { path: "/register", element: <Register />, publicOnly: true },
  { path: "/forgot-password", element: <ForgotPassword />, publicOnly: true },
  { path: "/overview", element: <Dashboard />, protected: true },
  { path: "/banners", element: <BannersPage />, protected: true },
  { path: "/categories", element: <CategoriesPage />, protected: true },
  { path: "/products", element: <ProductsPage />, protected: true },
  { path: "/users", element: <UserManagementPage />, protected: true },
  { path: "/vendors", element: <VendorsPage />, protected: true },
  { path: "/orders", element: <OrdersPage />, protected: true },
  { path: "/payments", element: <PaymentsPage />, protected: true },
  { path: "/reviews", element: <ReviewsPage />, protected: true },
  { path: "/notifications", element: <NotificationsPage />, protected: true },
  { path: "/notifications/send", element: <SendNotificationsPage />, protected: true },
  { path: "/settings", element: <SettingsPage />, protected: true },
];
