import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Shared pieces for the big admin "view details" modals (VendorViewDialog,
// UserViewDialog) — a labeled icon row, a titled section card wrapping a
// grid of rows, and an initials avatar for the dialog header.

export function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold",
        className
      )}
    >
      {initials}
    </div>
  );
}
