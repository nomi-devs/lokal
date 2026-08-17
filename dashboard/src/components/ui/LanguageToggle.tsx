import { useDirection } from "@/providers/DirectionProvider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { direction, toggleDirection } = useDirection();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-sidebar-accent p-0.5">
      <button
        type="button"
        onClick={() => direction !== "ltr" && toggleDirection()}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
          direction === "ltr"
            ? "bg-secondary text-secondary-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => direction !== "rtl" && toggleDirection()}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
          direction === "rtl"
            ? "bg-secondary text-secondary-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )}
      >
        العربية
      </button>
    </div>
  );
}
