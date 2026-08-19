# LOKAL

A production-ready, fully typed React admin dashboard. Started as a boilerplate kit — every page still doubles as a working example of the shared components — and is built out here as the admin panel for a marketplace, with mock data modeled directly on the product's ERD.

## Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router v7 |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui + Tailwind CSS 4 |
| i18n | react-i18next (English + Arabic, LTR/RTL) |
| Icons | Lucide React |

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

**Demo credentials** (defined in `src/constants/index.ts`):

| Email | Password | Role | Lands on |
|---|---|---|---|
| admin@gmail.com | admin123 | admin | `/admin/overview` |
| vendor@gmail.com | vendor123 | vendor | `/vendor/dashboard` |
| user@gmail.com | user123 | user | — (no dashboard yet) |

The vendor account logs in as **Studio Line Interiors** (`vendorId: 5` in `src/data/vendors.ts`), which has the richest mock data (products, orders).

## Rename / rebrand

```ts
// src/config.ts
export const APP_CONFIG = {
  name: "LOKAL",      // shown in sidebar when showName is true
  showName: true,      // false = logo only, true = logo + name
  logo: "/logo.png",   // swap this path (or point at a remote URL) to change the logo everywhere
  showLogo: true,      // false = name only (or nothing, if showName is also false)
};

export const AUTH_CONFIG = {
  loginRedirect: "/overview",
  logoutRedirect: "/login",
};
```

## Two dashboards, one app

The app serves two role-gated dashboards from the same boilerplate, split by URL prefix:

- **Admin** (`/admin/*`, role `admin`) — the full marketplace back office described below.
- **Vendor** (`/vendor/*`, role `vendor`) — a scoped-down dashboard a vendor uses to manage their own store (see [Vendor dashboard](#vendor-dashboard)).

`ProtectedRoute` (`src/routes/ProtectedRoute.tsx`) enforces the split: each route in `src/routes/config.tsx` declares a `role`, and a logged-in user hitting a route for the other role is redirected to their own home (`src/routes/roleHome.ts`). The root path `/` and post-login/logout redirects all resolve through the same helper, so there's a single source of truth for "where does this user belong."

## Admin marketplace modules

Each page under `src/pages/` manages one collection from the ERD, backed by matching mock data in `src/data/`. Every list page follows the same shape: `DataTable` (search, filter, sort, pagination, stats) + one dialog component that handles both add and edit.

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
| Addresses | `/admin/addresses` | `addresses.ts` | `ADDRESSES` |
| Wishlists | `/admin/wishlists` | `wishlists.ts` | `WISHLISTS` |
| Reviews | `/admin/reviews` | `reviews.ts` | `REVIEWS` |
| Analytics | `/admin/analytics` | `analytics.ts` | derived charts |
| Notifications | `/admin/notifications` | `notifications.ts` | admin-only, not in ERD |
| Settings | `/admin/settings` | `adminSettings.ts` | `ADMIN_SETTINGS` |

## Vendor dashboard

`src/pages/vendor/` — everything a vendor sees, scoped to their own `vendorId` (read from `state.auth.user.vendorId`, set at login). It reuses the same `DataTable`/`DynamicForm`/`DashboardLayout` primitives as the admin side rather than duplicating them.

| Page | Route | Scoped from |
|---|---|---|
| Dashboard | `/vendor/dashboard` | `products.ts` + `orders.ts`, filtered by `vendorId` |
| Products | `/vendor/products` | `products.ts` — add/edit/delete, `vendorId` implicit (not user-editable) |
| Orders | `/vendor/orders` | `orders.ts` — status update only affects this vendor's split of an order, not the whole order (see `vendorOrders` below) |
| Store Profile | `/vendor/store` | `vendors.ts` — the vendor's own business record |
| Analytics | `/vendor/analytics` | `products.ts` + `orders.ts`, derived (no separate mock file — see below) |

`src/pages/vendor/utils.ts` exports `getVendorOrders(vendorId)`, the shared helper that resolves one vendor's split of an order (`order.vendorOrders.find(vo => vo.vendorId === vendorId)`) — every vendor page that needs order data uses it instead of re-deriving the lookup. There's no separate vendor-analytics mock file: numbers are computed live from `orders.ts`/`products.ts` so they stay consistent with what the Orders/Products pages show. Order line items are only denormalized by name (no per-item `vendorId`), so "top selling products" falls back to the vendor's own product list sorted by rating count rather than exact units sold.

## Data layer

`src/data/*.ts` are typed mock arrays, not a real backend — swap the array for a `useQuery`/fetch call and the pages don't need to change. Field names/enums mirror the ERD directly (bilingual `nameEn`/`nameAr`, lowercase status enums, `*Id` foreign keys, `createdAt`/`updatedAt`), so cross-entity lookups (e.g. a vendor's products, an order's customer) are plain `.find()`/`.filter()` calls against the other data files — see `VendorViewDialog.tsx` or `OrdersPage/index.tsx` for the pattern.

## Project structure

```
src/
├── config.ts               ← app name/logo, auth redirects
├── constants/index.ts      ← sidebarItems (admin), vendorSidebarItems, mockUsers
├── routes/
│   ├── config.tsx          ← add/remove routes here — each entry declares protected/publicOnly/role
│   ├── roleHome.ts          ← role → default route ("admin" → /admin/overview, "vendor" → /vendor/dashboard)
│   ├── RoleHomeRedirect.tsx ← what "/" resolves to
│   └── ProtectedRoute.tsx   ← auth + role gate
│
├── data/                   ← typed mock collections, one file per ERD entity
├── i18n/locales/           ← en.json / ar.json translation trees
│
├── components/
│   ├── Dashboard/          ← layout system (sidebar, topbar, context) — shared by both dashboards
│   └── ui/
│       ├── StatsCard.tsx   ← configurable KPI card
│       ├── DataTable/      ← full-featured data table
│       └── card.tsx        ← base card primitives
│
├── pages/                  ← one folder per admin route (see table above)
│   └── vendor/             ← vendor dashboard pages + utils.ts (getVendorOrders)
├── store/slices/           ← Redux slices
└── providers/              ← ThemeProvider (light/dark)
```

## Adding a new page

1. Create `src/pages/MyPage/index.tsx` (or `src/pages/vendor/MyPage/index.tsx` for the vendor dashboard).
2. Wrap content in `<DashboardLayout sidebarItems={sidebarItems | vendorSidebarItems}>`.
3. Register in `src/routes/config.tsx`, prefixed and role-tagged to match its dashboard:

```tsx
{ path: "/admin/my-page", element: <MyPage />, protected: true, role: "admin" }
```

4. Add it to `sidebarItems` (admin) or `vendorSidebarItems` (vendor) in `src/constants/index.ts`.
5. Add any new `t("myPage....")` strings to **both** `src/i18n/locales/en.json` and `ar.json` — every user-facing string in this app goes through `useTranslation()`.

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
  { label: "Overview", labelKey: "sidebar.overview", icon: LayoutDashboard, path: "/overview" },
  { label: "Products",  labelKey: "sidebar.products",  icon: Package,        path: "/products" },
  {
    label: "Notifications", labelKey: "sidebar.notifications", icon: Bell,
    children: [
      { label: "Send",  labelKey: "sidebar.send",  path: "/notifications/send" },
      { label: "Inbox", labelKey: "sidebar.inbox", path: "/notifications" },
    ],
  },
];
```

`labelKey` is looked up via i18n; `label` is the fallback.

## Replacing mock auth

The mock login lives in `src/store/slices/authSlice.ts`. Replace the `login` reducer body with a real API call — `ProtectedRoute` and `PublicRoute` already read `state.auth.isAuthenticated`, so the routing layer needs no changes.

## Scripts

```bash
npm run dev      # dev server
npm run build    # type-check + production bundle
npm run lint     # ESLint
npm run preview  # serve production build
```
