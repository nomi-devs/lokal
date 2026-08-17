import { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = "error" | "success" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToastOptions {
  /** Optional bold heading above the message */
  title?: string;
  /** Auto-dismiss delay in ms. Pass 0 to keep until closed manually. Default: 4000 */
  duration?: number;
  /** Override the default type icon with any ReactNode */
  icon?: ReactNode;
  /** Show the × close button. Default: true */
  closeable?: boolean;
}

interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  message: string;
}

// ── Global event bus ──────────────────────────────────────────────────────────

type Handler = (item: ToastItem) => void;

const listeners = new Set<Handler>();
let counter = 0;

function uid() {
  return `t-${++counter}`;
}

function emit(item: ToastItem) {
  listeners.forEach((fn) => fn(item));
}

// ── toast API ─────────────────────────────────────────────────────────────────
// Usage:
//   toast.error("Passwords do not match.")
//   toast.success("Saved!", { title: "Done", duration: 3000 })
//   toast.error("Oops", { closeable: false, icon: <MyIcon /> })

function make(type: ToastType) {
  return (message: string, opts?: ToastOptions) =>
    emit({ id: uid(), type, message, closeable: true, duration: 4000, ...opts });
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  error: make("error"),
  success: make("success"),
  warning: make("warning"),
  info: make("info"),
};

// ── Per-type visual config ────────────────────────────────────────────────────

const STYLES: Record<
  ToastType,
  { bg: string; border: string; text: string; DefaultIcon: typeof AlertCircle }
> = {
  error: {
    bg: "bg-red-100 dark:bg-red-950/60",
    border: "border-red-400",
    text: "text-red-600 dark:text-red-400",
    DefaultIcon: AlertCircle,
  },
  success: {
    bg: "bg-green-100 dark:bg-green-950/60",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-400",
    DefaultIcon: CheckCircle2,
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    border: "border-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    DefaultIcon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-950/60",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    DefaultIcon: Info,
  },
};

// ── Position classes ──────────────────────────────────────────────────────────

const POSITION: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

// ── Single toast card ─────────────────────────────────────────────────────────

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { bg, border, text, DefaultIcon } = STYLES[item.type];
  const icon = item.icon ?? <DefaultIcon className={cn("w-5 h-5 shrink-0", text)} />;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm",
        "min-w-[280px] max-w-sm w-full",
        "animate-in slide-in-from-top-2 fade-in duration-200",
        bg,
        border
      )}
    >
      {icon}

      <div className="flex-1 min-w-0">
        {item.title && <p className={cn("text-sm font-bold leading-snug", text)}>{item.title}</p>}
        <p className={cn("text-sm leading-snug font-medium", text)}>{item.message}</p>
      </div>

      {item.closeable !== false && (
        <button
          onClick={onClose}
          className={cn("shrink-0 opacity-60 hover:opacity-100 transition-opacity", text)}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Toaster container ─────────────────────────────────────────────────────────
// Place once in your app (main.tsx):
//   <Toaster position="top-right" />

export interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position = "top-right" }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: Handler = (item) => {
      setToasts((prev) => [...prev, item]);

      if (item.duration !== 0) {
        setTimeout(() => remove(item.id), item.duration ?? 4000);
      }
    };

    listeners.add(handler);

    return () => {
      listeners.delete(handler);
    };
  }, [remove]);

  return (
    <div className={cn("fixed z-50 flex flex-col gap-2 pointer-events-none", POSITION[position])}>
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastCard item={item} onClose={() => remove(item.id)} />
        </div>
      ))}
    </div>
  );
}
