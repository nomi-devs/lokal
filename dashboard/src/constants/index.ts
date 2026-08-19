// src/constants/index.ts
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  Image,
  FolderTree,
  Store,
  ShoppingCart,
  Package,
  CreditCard,
  Star,
  Wallet,
  ShieldCheck,
  Tag,
  RotateCcw,
} from "lucide-react";

import type { SidebarItem } from "@/components/Dashboard/types";

// Colors and fonts → src/index.css  |  App name → src/config.ts

export const mockUsers: {
  id: string;
  email: string;
  password: string;
  role: "admin" | "user" | "vendor";
  vendorId?: number;
}[] = [
  { id: "1", email: "admin@gmail.com", password: "admin123", role: "admin" },
  { id: "2", email: "user@gmail.com", password: "user123", role: "user" },
  // Logs in as "Studio Line Interiors" — see src/data/vendors.ts (id 5)
  { id: "3", email: "vendor@gmail.com", password: "vendor123", role: "vendor", vendorId: 5 },
];

export const sidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    labelKey: "sidebar.overview",
    icon: LayoutDashboard,
    path: "/admin/overview",
  },
  { label: "Banners", labelKey: "sidebar.banners", icon: Image, path: "/admin/banners" },
  {
    label: "Categories",
    labelKey: "sidebar.categories",
    icon: FolderTree,
    path: "/admin/categories",
  },
  { label: "Products", labelKey: "sidebar.products", icon: Package, path: "/admin/products" },
  { label: "Users", labelKey: "sidebar.userManagement", icon: Users, path: "/admin/users" },
  { label: "Vendors", labelKey: "sidebar.vendors", icon: Store, path: "/admin/vendors" },
  {
    label: "KYC Verification",
    labelKey: "sidebar.kyc",
    icon: ShieldCheck,
    path: "/admin/kyc-verification",
  },
  { label: "Orders", labelKey: "sidebar.orders", icon: ShoppingCart, path: "/admin/orders" },
  { label: "Payments", labelKey: "sidebar.payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Reviews", labelKey: "sidebar.reviews", icon: Star, path: "/admin/reviews" },
  {
    label: "Promo Codes",
    labelKey: "sidebar.promoCodes",
    icon: Tag,
    path: "/admin/promo-codes",
  },
  {
    label: "Refunds",
    labelKey: "sidebar.refunds",
    icon: RotateCcw,
    path: "/admin/refunds",
  },
  {
    label: "Notifications",
    labelKey: "sidebar.notifications",
    icon: Bell,
    children: [
      { label: "Send", labelKey: "sidebar.send", path: "/admin/notifications/send" },
      { label: "Inbox", labelKey: "sidebar.inbox", path: "/admin/notifications" },
    ],
  },
  { label: "Settings", labelKey: "sidebar.settings", icon: Settings, path: "/admin/settings" },
];

export const vendorSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    labelKey: "vendor.sidebar.dashboard",
    icon: LayoutDashboard,
    path: "/vendor/dashboard",
  },
  {
    label: "Products",
    labelKey: "vendor.sidebar.products",
    icon: Package,
    path: "/vendor/products",
  },
  {
    label: "Orders",
    labelKey: "vendor.sidebar.orders",
    icon: ShoppingCart,
    path: "/vendor/orders",
  },
  {
    label: "Earnings",
    labelKey: "vendor.sidebar.earnings",
    icon: Wallet,
    path: "/vendor/earnings",
  },
  {
    label: "Notifications",
    labelKey: "vendor.sidebar.notifications",
    icon: Bell,
    path: "/vendor/notifications",
  },
  { label: "Profile", labelKey: "vendor.sidebar.profile", icon: Store, path: "/vendor/store" },
];
