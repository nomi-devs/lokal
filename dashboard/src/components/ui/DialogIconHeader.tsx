import type { LucideIcon } from "lucide-react";

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type DialogIconHeaderVariant = "success" | "danger" | "warning" | "info";

const iconBoxClass: Record<DialogIconHeaderVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export interface DialogIconHeaderProps {
  icon: LucideIcon;
  variant?: DialogIconHeaderVariant;
  title: string;
  description?: string;
}

// The icon-box + title/description block shared by every approve/reject/
// suspend confirmation dialog (see e.g. VendorActionDialog, RefundRejectDialog).
export default function DialogIconHeader({
  icon: Icon,
  variant = "danger",
  title,
  description,
}: DialogIconHeaderProps) {
  return (
    <DialogHeader>
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          iconBoxClass[variant]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </div>
    </DialogHeader>
  );
}
