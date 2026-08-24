// src/components/Dashboard/SidebarItem.tsx
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { SidebarItem as SidebarItemType } from "./types";
import { useDashboard } from "./context";

import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

interface SidebarItemProps {
  item: SidebarItemType;
}

export default function SidebarItem({ item }: SidebarItemProps) {
  const location = useLocation();
  const { sidebarState, isDesktop } = useDashboard();
  const { t } = useTranslation();

  const label = (key?: string, fallback?: string) => (key ? t(key) : (fallback ?? ""));

  const isPartial = sidebarState === "partial";

  const isActive = (path?: string, exact = false) => {
    if (!path) {
      return false;
    }

    if (exact) {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const hasChildren = "children" in item && item.children && item.children.length > 0;
  const isParentActive = hasChildren && item.children?.some((child) => isActive(child.path, true));

  // Seed open from current route so a hard-nav/refresh to a child shows parent expanded
  const [open, setOpen] = useState(() => !!isParentActive);

  // Keep parent open whenever a child route becomes active (client-side navigation)
  useEffect(() => {
    if (isParentActive) {
      setOpen(true);
    }
  }, [isParentActive]);

  const linkContent = (
    <Link
      to={item?.path || "#"}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        "path" in item &&
          isActive(item.path) &&
          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        isPartial && "justify-center px-0"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!isPartial && <span>{label(item.labelKey, item.label)}</span>}
    </Link>
  );

  if (!hasChildren) {
    if (!isDesktop) {
      return <SheetClose asChild>{linkContent}</SheetClose>;
    }

    return linkContent;
  }

  // Items with children — in partial mode just show the icon, no expand
  if (isPartial) {
    return (
      <div
        className={cn(
          "flex justify-center px-0 py-2 rounded-md transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer",
          isParentActive && "bg-sidebar-accent text-sidebar-foreground"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          isParentActive && "bg-sidebar-accent text-sidebar-foreground"
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className="h-4 w-4 shrink-0" />
          {label(item.labelKey, item.label)}
        </span>
        <ChevronDown
          size={16}
          className={cn("transition-transform shrink-0", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ms-7 border-s border-sidebar-border ps-3 mt-1 space-y-1">
          {item.children.map((child) =>
            isDesktop ? (
              <Link
                key={child.label}
                to={child.path}
                className={cn(
                  "block text-sm py-1.5 px-2 rounded-md transition-colors hover:text-sidebar-primary",
                  isActive(child.path, true)
                    ? "text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/60"
                )}
              >
                {label(child.labelKey, child.label)}
              </Link>
            ) : (
              <SheetClose asChild key={child.label}>
                <Link
                  to={child.path}
                  className={cn(
                    "block text-sm py-1.5 px-2 rounded-md transition-colors hover:text-sidebar-primary",
                    isActive(child.path, true)
                      ? "text-sidebar-primary font-semibold"
                      : "text-sidebar-foreground/60"
                  )}
                >
                  {label(child.labelKey, child.label)}
                </Link>
              </SheetClose>
            )
          )}
        </div>
      )}
    </div>
  );
}
