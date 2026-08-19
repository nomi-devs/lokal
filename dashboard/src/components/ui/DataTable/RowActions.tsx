import { useRef, useState, useEffect } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visible = actions.filter((a) => !a.hidden?.(row));

  if (visible.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[140px] rounded-lg border bg-popover shadow-md py-1">
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
        </div>
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
