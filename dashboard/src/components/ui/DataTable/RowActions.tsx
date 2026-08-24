import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

import type { RowData, RowAction } from "./types";

import { cn } from "@/lib/utils";

export function RowActionsMenu<T extends RowData>({
  row,
  actions,
}: {
  row: T;
  actions: RowAction<T>[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu is portaled to <body> (see below) so it isn't clipped by the
  // table's overflow-hidden/overflow-x-auto ancestors — position it with
  // fixed coordinates measured from the trigger instead of relying on
  // CSS `absolute` inside the scrolling table.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };
    // Table scroll (capture: true catches the inner overflow-x-auto div,
    // which doesn't bubble a scroll event to window) or a window resize
    // would leave the portaled menu floating over the wrong row.
    const handleReposition = () => setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const visible = actions.filter((a) => !a.hidden?.(row));

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="relative flex justify-end">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: position.top, right: position.right }}
            className="z-50 min-w-[140px] rounded-lg border bg-popover shadow-md py-1"
          >
            {visible.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onClick(row);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-muted text-left",
                    action.variant === "destructive" && "text-destructive hover:text-destructive",
                    action.variant === "warning" && "text-amber-500 hover:text-amber-500"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  {action.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

const inlineActionColor: Record<NonNullable<RowAction<RowData>["variant"]>, string> = {
  default: "text-primary hover:bg-primary/10",
  warning: "text-amber-500 hover:bg-amber-500/10",
  destructive: "text-destructive hover:bg-destructive/10",
};

export function RowActionsInline<T extends RowData>({
  row,
  actions,
}: {
  row: T;
  actions: RowAction<T>[];
}) {
  const visible = actions.filter((a) => !a.hidden?.(row));

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {visible.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            title={action.label}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md transition-colors",
              inlineActionColor[action.variant ?? "default"]
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="sr-only">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
