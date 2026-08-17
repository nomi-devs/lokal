import { useDispatch } from "react-redux";
import { LogOut, Menu } from "lucide-react";

import SidebarItem from "./SidebarItem";
import type { SidebarItem as SidebarItemType } from "./types";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config";

export default function MobileSidebar({ items }: { items: SidebarItemType[] }) {
  const dispatch = useDispatch();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 flex flex-col">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        {/* Logo — mirrors DesktopSidebar */}
        <div className="flex items-center h-16 border-b shrink-0 px-4">
          <img
            src={APP_CONFIG.logo}
            alt="Logo"
            className={cn(
              "object-contain shrink-0",
              APP_CONFIG.showName ? "w-8 h-8" : "w-full h-12"
            )}
          />
          {APP_CONFIG.showName && (
            <span className="ml-3 font-bold text-lg truncate">{APP_CONFIG.name}</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t p-2 shrink-0">
          <button
            onClick={() => dispatch(logout())}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
