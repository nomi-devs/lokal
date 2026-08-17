import { createContext, useContext, useState, useEffect } from "react";

export type SidebarState = "open" | "partial" | "collapsed";

const CYCLE: SidebarState[] = ["open", "partial", "collapsed"];

interface DashboardContextType {
  sidebarState: SidebarState;
  isDesktop: boolean;
  toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("open");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarState((prev) => {
      const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length];

      return next;
    });
  };

  return (
    <DashboardContext.Provider value={{ sidebarState, isDesktop, toggleSidebar }}>
      {children}
    </DashboardContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }

  return context;
};
