import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Plus, Search, X, type LucideIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  label: string;
  /** Shown inside the trigger box when nothing is selected yet. */
  placeholder?: string;
  /** Shown inside the dropdown's search input. */
  searchPlaceholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  /** Curated list shown in the dropdown — not exhaustive, typing a value that isn't here offers an "Add" action. */
  options: string[];
  /** Renders a small color-preview dot per chip/option. Looked up in `swatchMap` (case-insensitive) first; falls back to using the value directly as a CSS color, and finally to a plain outline if neither resolves. */
  showColorSwatch?: boolean;
  /** Lowercase color name -> hex, e.g. PRODUCT_COLOR_SWATCHES. Only relevant when showColorSwatch is set. */
  swatchMap?: Record<string, string>;
}

// Searchable multi-select dropdown for the admin and vendor product dialogs'
// Sizes and Colors fields. Deliberately hand-rolled instead of a portaled
// Radix Popover: this field always sits inside a Dialog, and a portaled
// popover's content renders outside the Dialog's own DOM subtree — clicking
// an option was being seen as an "outside click" by the surrounding
// dismissable layers, closing the dropdown (or the whole dialog) instead of
// toggling the value. Rendering the panel inline (no portal) plus a
// self-scoped pointerdown listener avoids that class of bug entirely: the
// panel is a real DOM descendant of this component's own container, so any
// ancestor's outside-click check is trivially satisfied.
export default function ProductMultiSelectField({
  icon: Icon,
  label,
  placeholder,
  searchPlaceholder,
  values,
  onChange,
  options,
  showColorSwatch = false,
  swatchMap,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function resolveSwatch(value: string): string {
    return swatchMap?.[value.toLowerCase()] ?? value;
  }

  // Union of the curated list and any already-selected custom values (added
  // via "Add") so those stay visible/toggleable from the list too, not just
  // removable via their chip.
  const allOptions = useMemo(() => {
    const extra = values.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));

    return [...options, ...extra];
  }, [options, values]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return q ? allOptions.filter((o) => o.toLowerCase().includes(q)) : allOptions;
  }, [allOptions, query]);

  const trimmedQuery = query.trim();

  const canAddCustom =
    trimmedQuery.length > 0 &&
    !allOptions.some((o) => o.toLowerCase() === trimmedQuery.toLowerCase());

  function toggle(value: string) {
    const exists = values.some((v) => v.toLowerCase() === value.toLowerCase());
    onChange(
      exists ? values.filter((v) => v.toLowerCase() !== value.toLowerCase()) : [...values, value]
    );
  }

  function addCustom() {
    if (!canAddCustom) {
      return;
    }

    onChange([...values, trimmedQuery]);
    setQuery("");
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleChipRemoveKeyDown(e: KeyboardEvent<HTMLSpanElement>, index: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      e.preventDefault();
      removeAt(index);
    }
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && canAddCustom) {
      e.preventDefault();
      addCustom();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setOpenUpward(spaceBelow < 300 && spaceAbove > spaceBelow);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Label className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {label}
      </Label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-md border bg-transparent px-2 py-1.5 text-start outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
        )}
      >
        {values.length === 0 ? (
          <span className="text-sm text-muted-foreground py-1">{placeholder}</span>
        ) : (
          values.map((value, i) => (
            <span
              key={`${value}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted pl-2.5 pr-1 py-1 text-xs font-medium bg-white"
            >
              {showColorSwatch && (
                <span
                  className="w-2.5 h-2.5 rounded-full border shrink-0"
                  style={{ backgroundColor: resolveSwatch(value) }}
                />
              )}
              {value}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
                onKeyDown={(e) => handleChipRemoveKeyDown(e, i)}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </span>
            </span>
          ))
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground ms-auto shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden",
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="flex-1 h-9 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && !canAddCustom && (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">No matches</p>
            )}
            {filtered.map((option) => {
              const selected = values.some((v) => v.toLowerCase() === option.toLowerCase());

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-4 h-4 rounded border shrink-0",
                      selected && "bg-primary border-primary text-primary-foreground"
                    )}
                  >
                    {selected && <Check className="w-3 h-3" />}
                  </span>
                  {showColorSwatch && (
                    <span
                      className="w-3 h-3 rounded-full border shrink-0"
                      style={{ backgroundColor: resolveSwatch(option) }}
                    />
                  )}
                  <span className="truncate">{option}</span>
                </button>
              );
            })}
          </div>

          {canAddCustom && (
            <button
              type="button"
              onClick={addCustom}
              className="flex w-full items-center gap-2 border-t px-3 py-2 text-sm text-primary hover:bg-muted/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Add &quot;{trimmedQuery}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
