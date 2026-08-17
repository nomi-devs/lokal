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

| Email | Password | Role |
|---|---|---|
| admin@gmail.com | admin123 | admin |
| user@gmail.com | user123 | user |

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

## Marketplace modules

Each page under `src/pages/` manages one collection from the ERD, backed by matching mock data in `src/data/`. Every list page follows the same shape: `DataTable` (search, filter, sort, pagination, stats) + one dialog component that handles both add and edit.

| Page | Route | Data file | Entity |
|---|---|---|---|
| Overview | `/overview` | `dashboardUsers.ts`, `analytics.ts` | dashboard widgets |
| Banners | `/banners` | `banners.ts` | `CONTENT` (type: `banner`) |
| Categories | `/categories` | `categories.ts` | `CATEGORIES` |
| Products | `/products` | `products.ts` | `PRODUCTS` |
| Users | `/users` | `users.ts` | `USERS` |
| Vendors | `/vendors` | `vendors.ts` | `VENDORS` |
| Orders | `/orders` | `orders.ts` | `ORDERS` |
| Payments | `/payments` | `payments.ts` | `PAYMENTS` |
| Addresses | `/addresses` | `addresses.ts` | `ADDRESSES` |
| Wishlists | `/wishlists` | `wishlists.ts` | `WISHLISTS` |
| Reviews | `/reviews` | `reviews.ts` | `REVIEWS` |
| Analytics | `/analytics` | `analytics.ts` | derived charts |
| Notifications | `/notifications` | `notifications.ts` | admin-only, not in ERD |
| Settings | `/settings` | `adminSettings.ts` | `ADMIN_SETTINGS` |

## Data layer

`src/data/*.ts` are typed mock arrays, not a real backend — swap the array for a `useQuery`/fetch call and the pages don't need to change. Field names/enums mirror the ERD directly (bilingual `nameEn`/`nameAr`, lowercase status enums, `*Id` foreign keys, `createdAt`/`updatedAt`), so cross-entity lookups (e.g. a vendor's products, an order's customer) are plain `.find()`/`.filter()` calls against the other data files — see `VendorViewDialog.tsx` or `OrdersPage/index.tsx` for the pattern.

## Project structure

```
src/
├── config.ts               ← app name/logo, auth redirects
├── constants/index.ts      ← sidebarItems, mockUsers
├── routes/config.tsx       ← add/remove routes here
│
├── data/                   ← typed mock collections, one file per ERD entity
├── i18n/locales/           ← en.json / ar.json translation trees
│
├── components/
│   ├── Dashboard/          ← layout system (sidebar, topbar, context)
│   └── ui/
│       ├── StatsCard.tsx   ← configurable KPI card
│       ├── DataTable/      ← full-featured data table
│       └── card.tsx        ← base card primitives
│
├── pages/                  ← one folder per route (see table above)
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
