import type { LucideIcon } from "lucide-react";

export interface SidebarChild {
  label: string;
  labelKey?: string;
  path: string;
}

export interface SidebarParent {
  label: string;
  labelKey?: string;
  icon: LucideIcon;
  children: SidebarChild[];
  path?: string;
}

export interface SidebarLink {
  label: string;
  labelKey?: string;
  icon: LucideIcon;
  path: string;
}

export type SidebarItem = SidebarParent | SidebarLink;

export interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  topbarTitle?: string;
  children: React.ReactNode;
}
