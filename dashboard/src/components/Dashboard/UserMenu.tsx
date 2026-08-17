import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown, Settings, LogOut } from "lucide-react";

import type { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function UserMenu() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  const localPart = user.email.split("@")[0];
  const displayName = titleCase(localPart);
  const roleLabel = titleCase(user.role);
  const initials = localPart.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 pl-1 rounded-lg transition-colors hover:bg-sidebar-accent py-1 pr-1.5"
      >
        <span className="w-9 h-9 rounded-full bg-sidebar-accent text-sidebar-foreground text-xs font-bold flex items-center justify-center shrink-0">
          {initials}
        </span>
        <div className="hidden sm:flex flex-col leading-tight text-start">
          <span className="text-sm font-semibold text-sidebar-foreground">{displayName}</span>
          <span className="text-xs text-sidebar-foreground/60">{roleLabel}</span>
        </div>
        <ChevronDown
          className={cn(
            "hidden sm:block w-4 h-4 text-sidebar-foreground/50 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 w-64 rounded-xl border bg-popover text-popover-foreground shadow-lg overflow-hidden z-20"
        >
          <div className="px-4 py-3">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="border-t" />
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            {t("sidebar.settings")}
          </Link>
          <div className="border-t" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              dispatch(logout());
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("common.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
