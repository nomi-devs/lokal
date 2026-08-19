# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo contains a single project, [dashboard/](dashboard/) — all commands below must be run from that directory. There is no root-level `package.json`.

## Commands

```bash
cd dashboard
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Type-check (tsc -b) then bundle for production
npm run lint       # ESLint across all TypeScript files
npm run format     # Prettier --write on src/**/*.{ts,tsx,css,json}
npm run preview    # Serve the production build locally
```

No test runner is configured.

**Demo credentials** (hardcoded in `src/constants/index.ts`): `admin@gmail.com` / `admin123` (admin → `/admin/overview`), `vendor@gmail.com` / `vendor123` (vendor → `/vendor/dashboard`, logs in as vendor id 5), `user@gmail.com` / `user123` (user role, no dashboard yet).

## Purpose

Started as a dashboard template/boilerplate (every page still doubles as a working example of the shared components) and is being built out as two role-gated dashboards for a marketplace — an admin back office and a vendor self-service dashboard — with mock data modeled directly on the product's ERD. When adding features, keep the template-friendly patterns: shared constants, single config file, no page-specific duplication.

## Architecture

### Stack
- **React 19 + TypeScript 6**, bundled with **Vite 8**
- **React Router v7** for client-side routing
- **Redux Toolkit** for global state (`authSlice`, `itemsSlice`), persisted via **Redux Persist** (localStorage key: `persist:auth`)
- **React Context** (`ThemeProvider`, `DirectionProvider`) for light/dark mode and LTR/RTL, persisted to `localStorage`
- **React Hook Form + Zod 4** for form validation
- **shadcn/ui** (Radix UI primitives) + **Tailwind CSS 4** for UI
- **react-i18next** for i18n — English + Arabic, LTR/RTL

### Single-file configuration
[src/config.ts](dashboard/src/config.ts) — app name, logo, description, version, and auth redirect paths (`AUTH_CONFIG.loginRedirect` / `logoutRedirect`). All components that display the app name/logo import from here; this is the rename/rebrand entry point.

### Path alias
`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

### Routing — two role-gated dashboards
Routes are declared in [src/routes/config.tsx](dashboard/src/routes/config.tsx) and rendered by [src/routes/index.tsx](dashboard/src/routes/index.tsx). Every admin route lives under `/admin/*`, every vendor route under `/vendor/*`; each protected `AppRoute` entry carries a `role: "admin" | "vendor"` alongside `protected`/`publicOnly`:
- `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`) — redirects unauthenticated users to `/login`; if `allowedRoles` is set and the logged-in user's role doesn't match, redirects to that user's own home instead of rendering
- `PublicRoute` — redirects an already-authenticated user to their role's home (not a fixed path)
- [src/routes/roleHome.ts](dashboard/src/routes/roleHome.ts) is the single source of truth for "where does this role belong" (`admin` → `/admin/overview`, `vendor` → `/vendor/dashboard`); both guards and `RoleHomeRedirect` (what `/` resolves to) read it
- catch-all renders `NotFoundPage`

Auth state is read from Redux (`isAuthenticated`, `user.role`, `user.vendorId` in `authSlice`), persisted to `localStorage` via redux-persist (key `persist:auth`).

To add a page: create `src/pages/MyPage/index.tsx` (or `src/pages/vendor/MyPage/index.tsx`) wrapped in `<DashboardLayout>`, register it in `routes/config.tsx` under the matching `/admin` or `/vendor` prefix with its `role`, add it to `sidebarItems` or `vendorSidebarItems` in `src/constants/index.ts`, and add its `t("myPage....")` strings to **both** `src/i18n/locales/en.json` and `ar.json` — every user-facing string goes through `useTranslation()`.

### Authentication
**Mock-only**: hardcoded users in [src/constants/index.ts](dashboard/src/constants/index.ts). `authSlice` (`src/store/slices/authSlice.ts`) validates credentials and stores `{ id, email, role, vendorId? }` — `vendorId` links a vendor-role login to its record in `src/data/vendors.ts`. To swap for a real backend, replace the `login` reducer body — `ProtectedRoute`/`PublicRoute` already read `state.auth`, so the routing layer needs no changes.

### State (Redux)
Store in [src/store/index.ts](dashboard/src/store/index.ts):
- `authSlice` — login, logout, register + `isAuthenticated` / `currentUser`
- `itemsSlice` — placeholder for feature data

### Layout
One active layout system in [src/components/Dashboard/](dashboard/src/components/Dashboard/):
- `DashboardLayout` — entry point, wraps `DashboardProvider`; usage: `<DashboardLayout sidebarItems={sidebarItems} topbarTitle="Page Title">`
- `DesktopSidebar` — 3-state, cycled via the hamburger button: open (`w-64`) → partial/icons-only (`w-16`) → collapsed (hidden)
- `MobileSidebar` — Sheet-based drawer, same logo/logout structure as desktop
- `Topbar` — hamburger toggle + page title + theme toggle
- `context.tsx` — `sidebarState`, `isDesktop`, `toggleSidebar`

### Sidebar items
`sidebarItems` (admin) and `vendorSidebarItems` (vendor) in [src/constants/index.ts](dashboard/src/constants/index.ts), each passed to `DashboardLayout` by the pages of that dashboard — change one to update all its pages simultaneously. `labelKey` is looked up via i18n; `label` is the fallback. Supports nested `children` (e.g. admin Notifications → Send / Inbox). `DesktopSidebar` renders its own Logout button, so sidebar arrays don't include one.

### Marketplace modules and mock data (admin)
Each page under `src/pages/` manages one collection from the ERD, backed by matching mock data in `src/data/`. Every list page follows the same shape: `DataTable` (search, filter, sort, pagination, stats) + one dialog component handling both add and edit.

| Page | Route | Data file | Entity |
|---|---|---|---|
| Overview | `/admin/overview` | `dashboardUsers.ts`, `analytics.ts` | dashboard widgets |
| Banners | `/admin/banners` | `banners.ts` | `CONTENT` (type: `banner`) |
| Categories | `/admin/categories` | `categories.ts` | `CATEGORIES` |
| Products | `/admin/products` | `products.ts` | `PRODUCTS` |
| Users | `/admin/users` | `users.ts` | `USERS` |
| Vendors | `/admin/vendors` | `vendors.ts` | `VENDORS` |
| Orders | `/admin/orders` | `orders.ts` | `ORDERS` |
| Payments | `/admin/payments` | `payments.ts` | `PAYMENTS` |
| Reviews | `/admin/reviews` | `reviews.ts` | `REVIEWS` |
| Notifications | `/admin/notifications`, `/admin/notifications/send` | `notifications.ts` | admin-only, not in ERD |
| Settings | `/admin/settings` | `adminSettings.ts` | `ADMIN_SETTINGS` |

`src/data/*.ts` are typed mock arrays, not a real backend — swap the array for a `useQuery`/fetch call and the pages don't need to change. Field names/enums mirror the ERD directly (bilingual `nameEn`/`nameAr`, lowercase status enums, `*Id` foreign keys, `createdAt`/`updatedAt`), so cross-entity lookups (e.g. a vendor's products, an order's customer) are plain `.find()`/`.filter()` calls against other data files — see `VendorViewDialog.tsx` or `OrdersPage/index.tsx` for the pattern. `addresses.ts` and `wishlists.ts` also exist as data files without dedicated routes yet.

### Vendor dashboard
[src/pages/vendor/](dashboard/src/pages/vendor/) — Dashboard, Products, Orders, Store Profile, Analytics, all scoped to `state.auth.user.vendorId`. Reuses the same `DataTable`/`DynamicForm`/`DashboardLayout` primitives as the admin side rather than duplicating them; `VendorProducts` and its `VendorProductFormDialog` are the vendor-scoped counterpart to the admin `ProductsPage` (same fields, minus the vendor picker — `vendorId` is implicit from the logged-in user).

[src/pages/vendor/utils.ts](dashboard/src/pages/vendor/utils.ts) exports `getVendorOrders(vendorId)`, which resolves one vendor's split of an order (`order.vendorOrders.find(vo => vo.vendorId === vendorId)`) — every vendor page needing order data uses it instead of re-deriving the lookup. There's no separate vendor-analytics mock file: `VendorDashboard` and `VendorAnalytics` compute their numbers live from `orders.ts`/`products.ts` so they stay consistent with the rest of the app (same convention as `totalRevenue` in `orders.ts`). Order line items are denormalized by name only (no per-item `vendorId`), so "top selling products" falls back to sorting the vendor's own product list by rating count rather than exact units sold.

### Key UI components

| Component | Path | Purpose |
|---|---|---|
| `StatsCard` | `src/components/ui/StatsCard.tsx` | Configurable KPI card — variant, size, trend, loading, prefix/suffix, footer, onClick |
| `DataTable` | `src/components/ui/DataTable/` | Full table system — search, filter, sort, pagination, selection, row actions, toolbar actions, stats strip |
| `Card` | `src/components/ui/card.tsx` | Base card primitives (Card, CardHeader, CardTitle, CardContent, CardFooter) |
| `DynamicForm` | `src/components/form/DynamicForm.tsx` | Schema-driven form builder (Zod + react-hook-form) |

`DataTable` usage:

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

Custom cell renderer: `{ key: "status", header: "Status", render: (v, row) => <Badge>{v as string}</Badge> }`

### Add/edit dialog pattern
Every entity uses **one** dialog for both add and edit — see `CategoryFormDialog.tsx` as the reference:

```tsx
interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: MyEntity | null;       // omit/null → add mode, pass a row → edit mode
  onSubmit: (values: FormValues, editingId: number | null) => void;
}
```

The dialog derives `isEdit = !!entity` and re-seeds the form via `reset()` in a `useEffect` keyed on `[open, entity]`.

### Forms
[src/components/form/DynamicForm.tsx](dashboard/src/components/form/DynamicForm.tsx) — pass a Zod schema and field config array; handles layout, validation, and submission.

### Theming
[src/providers/ThemeProvider.tsx](dashboard/src/providers/ThemeProvider.tsx) provides `useTheme()`. Dark mode toggled via a class on the document root; Tailwind configured for `class`-based dark mode. [src/providers/DirectionProvider.tsx](dashboard/src/providers/DirectionProvider.tsx) handles LTR/RTL for i18n.

### UI Primitives
`src/components/ui/` — shadcn/ui components. `cn()` in [src/lib/utils.ts](dashboard/src/lib/utils.ts) merges Tailwind classes.
