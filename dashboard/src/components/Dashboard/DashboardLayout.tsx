import { DashboardProvider, useDashboard } from "./context";
import DesktopSidebar from "./DesktopSidebar";
import Topbar from "./Topbar";
import type { DashboardLayoutProps } from "./types";

function DashboardContent({ sidebarItems, topbarTitle, children }: DashboardLayoutProps) {
  const { isDesktop, sidebarState } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden">
      {isDesktop && sidebarState !== "collapsed" && <DesktopSidebar items={sidebarItems} />}
      <div className="flex flex-col flex-1 overflow-y-auto min-w-0">
        <Topbar title={topbarTitle} items={sidebarItems} />
        <main className="flex-1 p-4 bg-background">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
}
