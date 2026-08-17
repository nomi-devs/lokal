import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import SidebarItem from "./SidebarItem";
import type { SidebarItem as SidebarItemType } from "./types";
import { useDashboard } from "./context";

import { cn } from "@/lib/utils";
import { logout } from "@/store/slices/authSlice";
import { APP_CONFIG } from "@/config";

export default function DesktopSidebar({ items }: { items: SidebarItemType[] }) {
  const { sidebarState } = useDashboard();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isPartial = sidebarState === "partial";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-sidebar-border border-r shrink-0 overflow-hidden transition-all duration-300",
        isPartial ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center justify-center h-16 border-b border-sidebar-border shrink-0 px-4",
          isPartial && "justify-center px-0"
        )}
      >
        {APP_CONFIG.showLogo && (
          <img
            src={APP_CONFIG.logo}
            alt="Logo"
            className={cn(
              "object-contain shrink-0",
              isPartial || APP_CONFIG.showName ? "w-8 h-8" : "w-full h-12"
            )}
          />
        )}
        {!isPartial && APP_CONFIG.showName && (
          <span className={cn("font-bold text-lg truncate", APP_CONFIG.showLogo && "ml-3")}>
            {APP_CONFIG.name}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <button
          onClick={() => dispatch(logout())}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-white",
            isPartial && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isPartial && <span>{t("common.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
