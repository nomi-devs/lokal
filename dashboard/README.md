# Dashboard Kit

A production-ready, fully typed React dashboard boilerplate. Clone it, rename it, and start building — all the hard parts are already wired up.

## Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router v7 |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui + Tailwind CSS 4 |
| Icons | Lucide React |

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

**Demo credentials** (defined in `src/constants/index.ts`):

| Email | Password | Role |
|---|---|---|
| admin@gmail.com | admin123 | admin |
| user@gmail.com | user123 | user |

## Rename / rebrand

Every name and description string is in one file:

```ts
// src/config.ts
export const APP_CONFIG = {
  name: "Dashboard Kit",   // ← sidebar title, page headings
  description: "...",
  version: "1.0.0",
};
```

## Project structure

```
src/
├── config.ts               ← app name, auth redirects
├── constants/index.ts      ← sidebarItems, mockUsers, theme tokens
├── routes/config.tsx       ← add/remove routes here
│
├── components/
│   ├── Dashboard/          ← layout system (sidebar, topbar, context)
│   └── ui/
│       ├── StatsCard.tsx   ← configurable KPI card
│       ├── DataTable/      ← full-featured data table
│       └── card.tsx        ← base card primitives
│
├── pages/                  ← one folder per route
├── store/slices/           ← Redux slices
└── providers/              ← ThemeProvider (light/dark)
```

## Adding a new page

1. Create `src/pages/MyPage/index.tsx`
2. Wrap content in `<DashboardLayout>`
3. Register in `src/routes/config.tsx`:

```tsx
{ path: "/my-page", element: <MyPage />, protected: true }
```

4. Add it to `sidebarItems` in `src/constants/index.ts`.

## Key components

### StatsCard

```tsx
<StatsCard
  title="Total Revenue"
  value="48,295"
  prefix="$"
  icon={DollarSign}
  variant="success"           // default | primary | success | warning | danger | info
  size="md"                   // sm | md | lg
  trend={{ value: 12.5, label: "vs last month" }}
  loading={false}
  footer="Updated just now"
  onClick={() => {}}
/>
```

### DataTable

```tsx
<DataTable<MyType>
  data={rows}
  columns={columns}           // ColumnDef<MyType>[]
  rowKey="id"
  searchable
  searchKeys={["name", "email"]}
  filters={[{ key: "status", label: "Status", options: [...] }]}
  selectable
  rowActions={[{ label: "Edit", icon: Pencil, onClick: (r) => {} }]}
  toolbarActions={[{ label: "Delete", requiresSelection: true, onClick: (rows) => {} }]}
  pagination={{ pageSize: 10 }}
  stats={[...]}               // StatsCard[] rendered above the table
  loading={false}
  striped
/>
```

Custom cell renderer:

```tsx
{ key: "status", header: "Status", render: (v, row) => <Badge>{v as string}</Badge> }
```

### DashboardLayout

```tsx
<DashboardLayout sidebarItems={sidebarItems} topbarTitle="Page Title">
  {/* page content */}
</DashboardLayout>
```

The sidebar cycles through three states via the hamburger button: **open → partial (icons only) → collapsed**.

## Sidebar items

Defined once in `src/constants/index.ts`, imported by every page:

```ts
export const sidebarItems: SidebarItem[] = [
  { label: "Home",     icon: Home,    path: "/Home" },
  { label: "Users",    icon: Users,   children: [
    { label: "Products", path: "/users/products" },
  ]},
  { label: "Products", icon: Package, path: "/products" },
];
```

## Replacing mock auth

The mock login lives in `src/store/slices/authSlice.ts`. Replace the `login` reducer body with a real API call — `ProtectedRoute` and `PublicRoute` already read `state.auth.isAuthenticated`, so the routing layer needs no changes.

## Scripts

```bash
npm run dev      # dev server
npm run build    # type-check + production bundle
npm run lint     # ESLint
npm run preview  # serve production build
```
