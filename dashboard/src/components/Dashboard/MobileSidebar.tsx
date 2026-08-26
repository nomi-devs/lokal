import { useDispatch } from "react-redux";
import { LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

import SidebarItem from "./SidebarItem";
import type { SidebarItem as SidebarItemType } from "./types";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logoutAsync } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config";
import type { AppDispatch } from "@/store";

export default function MobileSidebar({ items }: { items: SidebarItemType[] }) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-58 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        {/* Logo — mirrors DesktopSidebar */}
        <div className="flex items-center h-16 border-b border-sidebar-border shrink-0 px-4">
          {APP_CONFIG.showLogo && (
            <img
              src={APP_CONFIG.logo}
              alt="Logo"
              className={cn(
                "object-contain shrink-0",
                APP_CONFIG.showName ? "w-8 h-8" : "w-full h-12"
              )}
            />
          )}
          {APP_CONFIG.showName && (
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
            onClick={() => dispatch(logoutAsync())}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-white"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
