import { Menu } from "lucide-react";

import type { SidebarItem } from "./types";
import { useDashboard } from "./context";
import MobileSidebar from "./MobileSidebar";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DirectionToggle } from "@/components/ui/DirectionToggle";
import { Button } from "@/components/ui/button";

export default function Topbar({ title, items }: { title?: string; items: SidebarItem[] }) {
  const { isDesktop, toggleSidebar } = useDashboard();

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b px-4 h-14 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {!isDesktop ? (
          <MobileSidebar items={items} />
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu />
          </Button>
        )}
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <DirectionToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
