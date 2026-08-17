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
  BarChart3,
} from "lucide-react";

import type { SidebarItem } from "@/components/Dashboard/types";

// Colors and fonts → src/index.css  |  App name → src/config.ts

export const mockUsers = [
  { id: "1", email: "admin@gmail.com", password: "admin123", role: "admin" },
  { id: "2", email: "user@gmail.com", password: "user123", role: "user" },
];

export const sidebarItems: SidebarItem[] = [
  { label: "Overview", labelKey: "sidebar.overview", icon: LayoutDashboard, path: "/overview" },
  { label: "Banners", labelKey: "sidebar.banners", icon: Image, path: "/banners" },
  { label: "Categories", labelKey: "sidebar.categories", icon: FolderTree, path: "/categories" },
  { label: "Users", labelKey: "sidebar.userManagement", icon: Users, path: "/users" },
  { label: "Vendors", labelKey: "sidebar.vendors", icon: Store, path: "/vendors" },
  { label: "Orders", labelKey: "sidebar.orders", icon: ShoppingCart, path: "/orders" },
  { label: "Analytics", labelKey: "sidebar.analytics", icon: BarChart3, path: "/analytics" },
  {
    label: "Notifications",
    labelKey: "sidebar.notifications",
    icon: Bell,
    children: [
      { label: "Send", labelKey: "sidebar.send", path: "/notifications/send" },
      { label: "Inbox", labelKey: "sidebar.inbox", path: "/notifications" },
    ],
  },
  { label: "Settings", labelKey: "sidebar.settings", icon: Settings, path: "/settings" },
];
