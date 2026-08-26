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
  HelpCircle,
} from "lucide-react";

import type { SidebarItem } from "@/components/Dashboard/types";

// Colors and fonts → src/index.css  |  App name → src/config.ts

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
    label: "FAQ",
    labelKey: "sidebar.faq",
    icon: HelpCircle,
    path: "/admin/faqs",
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

// Curated quick-add suggestions for the product Sizes/Colors chip fields
// (ProductTagsField, used by both the admin and vendor product dialogs) —
// click one instead of typing it out. Not exhaustive; free typing still
// works for anything not listed here.
export const PRODUCT_SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
export const PRODUCT_COLOR_SUGGESTIONS = [
  "Black",
  "White",
  "Gray",
  "Silver",
  "Beige",
  "Cream",
  "Ivory",
  "Khaki",
  "Tan",
  "Camel",
  "Brown",
  "Charcoal",
  "Navy",
  "Blue",
  "Sky Blue",
  "Teal",
  "Turquoise",
  "Green",
  "Olive",
  "Mint",
  "Emerald",
  "Yellow",
  "Gold",
  "Mustard",
  "Orange",
  "Rust",
  "Red",
  "Maroon",
  "Burgundy",
  "Pink",
  "Rose Gold",
  "Fuchsia",
  "Purple",
  "Lavender",
  "Multicolor",
];

// Explicit name -> hex map for the swatch dot next to each color chip/suggestion.
// Needed because most real fashion color names ("Burgundy", "Charcoal", "Rose
// Gold"...) aren't valid CSS color keywords the browser can resolve on its
// own — ProductTagsField falls back to using the raw value as a CSS color
// (works for plain names like "Red") only when a value has no entry here.
// Keyed lowercase; "Multicolor" is intentionally omitted (no single color).
export const PRODUCT_COLOR_SWATCHES: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
  silver: "#C0C0C0",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  ivory: "#FFFFF0",
  khaki: "#C3B091",
  tan: "#D2B48C",
  camel: "#C19A6B",
  brown: "#8B5E3C",
  charcoal: "#36454F",
  navy: "#000080",
  blue: "#2563EB",
  "sky blue": "#87CEEB",
  teal: "#008080",
  turquoise: "#40E0D0",
  green: "#16A34A",
  olive: "#808000",
  mint: "#98FF98",
  emerald: "#10B981",
  yellow: "#FACC15",
  gold: "#D4AF37",
  mustard: "#E1AD01",
  orange: "#F97316",
  rust: "#B7410E",
  red: "#DC2626",
  maroon: "#800000",
  burgundy: "#800020",
  pink: "#EC4899",
  "rose gold": "#B76E79",
  fuchsia: "#D946EF",
  purple: "#9333EA",
  lavender: "#E6E6FA",
};
