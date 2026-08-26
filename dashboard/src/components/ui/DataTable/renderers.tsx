// Shared `ColumnDef.render` implementations for the cell shapes that were
// hand-copied identically across many pages' column configs (date columns,
// KWD currency columns) — use directly as `render: renderDate` /
// `render: renderCurrency` instead of redefining the same inline function.

export function renderDate(value: unknown): string {
  return new Date(value as string).toLocaleDateString();
}

export function renderCurrency(value: unknown) {
  return <span className="font-semibold">{(value as number).toLocaleString()} KWD</span>;
}
