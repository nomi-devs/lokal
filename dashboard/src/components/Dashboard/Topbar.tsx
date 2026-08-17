import { Menu, Bell } from "lucide-react";
import { Link } from "react-router-dom";

import type { SidebarItem } from "./types";
import { useDashboard } from "./context";
import MobileSidebar from "./MobileSidebar";
import UserMenu from "./UserMenu";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Button } from "@/components/ui/button";

export default function Topbar({ title, items }: { title?: string; items: SidebarItem[] }) {
  const { isDesktop, toggleSidebar } = useDashboard();

  return (
    <div className="flex items-center justify-between bg-sidebar text-sidebar-foreground border-b border-sidebar-border px-4 h-16 min-h-16 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {!isDesktop ? (
          <MobileSidebar items={items} />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0"
          >
            <Menu />
          </Button>
        )}
        <h1 className="font-semibold text-lg truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <LanguageToggle />
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Link to="/notifications">
            <Bell />
          </Link>
        </Button>
        <UserMenu />
      </div>
    </div>
  );
}
