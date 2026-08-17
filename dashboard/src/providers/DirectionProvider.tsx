import React, { createContext, useContext, useEffect, useState } from "react";

import i18n from "@/i18n";

type Direction = "ltr" | "rtl";
interface DirectionContextType {
  direction: Direction;
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>(
    (localStorage.getItem("direction") as Direction) || "ltr"
  );

  useEffect(() => {
    document.documentElement.dir = direction;
    localStorage.setItem("direction", direction);
    i18n.changeLanguage(direction === "rtl" ? "ar" : "en");
    localStorage.setItem("language", direction === "rtl" ? "ar" : "en");
  }, [direction]);

  const toggleDirection = () => {
    setDirection((prev) => (prev === "ltr" ? "rtl" : "ltr"));
  };

  return (
    <DirectionContext.Provider value={{ direction, toggleDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
  const context = useContext(DirectionContext);

  if (!context) {
    throw new Error("useDirection must be used within DirectionProvider");
  }

  return context;
}
