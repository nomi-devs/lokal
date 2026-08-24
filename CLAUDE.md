# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent projects, each run from its own directory — there is no root-level `package.json` and the two are not wired together (the dashboard currently runs on mock data, not `local-be`):
- [dashboard/](dashboard/) — admin/vendor React dashboard (frontend)
- [local-be/](local-be/) — NestJS + MongoDB backend API

## Commands

### Dashboard (`dashboard/`)

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

### Backend (`local-be/`)

```bash
cd local-be
npm run start:dev   # Nest dev server, watch mode (default port 3000)
npm run build       # nest build
npm run lint        # ESLint --fix across src/apps/libs/test
npm run format      # Prettier --write on src/**/*.ts and test/**/*.ts
npm run test         # Jest unit tests (*.spec.ts, co-located under src/)
npm run test:e2e     # Jest e2e tests (test/jest-e2e.json)
npm run test:cov     # Jest with coverage
npm run seed:admin   # Create the initial admin user from ADMIN_* env vars (safe to re-run)
```

Requires a `local-be/.env` (gitignored, not committed). Required: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. Optional with defaults or best-effort no-ops when unset: `PORT`, `CORS_ORIGINS`, `API_BASE_URL` (publicly-reachable base URL used to build MyFatoorah's CallBackUrl/ErrorUrl — defaults to `http://localhost:$PORT`, which only works for local-only smoke testing), OTP/session tuning (`OTP_LENGTH`, `OTP_EXPIRY_MINUTES`, `OTP_MAX_ATTEMPTS`, `OTP_MAX_REQUESTS_PER_HOUR`, `BCRYPT_ROUNDS`, `MAX_ACTIVE_SESSIONS`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`), file uploads (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`, `S3_UPLOAD_PREFIX`, `S3_SIGNED_URL_EXPIRATION`, `S3_MAX_UPLOAD_BYTES`), SMS OTP delivery (`SMS_BASE_URL`, `SMS_USERNAME`, `SMS_PASSWORD`, `SMS_CUSTOMERID`, `SMS_SENDER`), email (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`), push notifications via FCM (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — service-account credentials; delivery is best-effort and silently no-ops when unset, same as SMS/email), cart (`CART_DELIVERY_FEE`, flat fee applied per vendor order, default `15`), MyFatoorah payments (`MYFATOORAH_TOKEN`, `MYFATOORAH_BASE_URL` — e.g. `https://apitest.myfatoorah.com` for sandbox; `MYFATOORAH_CURRENCY` default `KWD`, `MYFATOORAH_COUNTRY_CODE` default `+965`; checkout throws `PAYMENT_GATEWAY_ERROR` if attempted while these are unset), and admin seeding (`ADMIN_PHONE`, `ADMIN_PASSWORD` required for `seed:admin`; `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` optional). Each module validates its own vars on boot via a `class-validator` `EnvironmentVariablesValidator` in its `config/*.config.ts` — see Config below.

Once running: Swagger UIs at `http://localhost:3000/api-docs/mobile` and `/api-docs/dashboard`.

## Purpose

The dashboard started as a template/boilerplate (every page still doubles as a working example of the shared components) and is being built out as two role-gated dashboards for a marketplace — an admin back office and a vendor self-service dashboard — with mock data modeled directly on the product's ERD. `local-be` is the real backend for the same marketplace (customer/driver mobile app + vendor/admin dashboard), built independently against the same ERD/PDF; the dashboard has not yet been wired to it. When adding features to the dashboard, keep the template-friendly patterns: shared constants, single config file, no page-specific duplication. When adding features to `local-be`, keep the module-per-concern, domain/infrastructure separation described below.

## Design source of truth

[Local-App.pdf](Local-App.pdf) (repo root) is the client-approved, final design — the source of truth for both `local-be` and `dashboard/`. New pages, flows, fields, and entities should match what it specifies; when it conflicts with existing mock data/ERD assumptions in this repo, the PDF wins and the code should be updated to match it, not the other way around.

## Dashboard architecture

### Naming conventions

Follow these exactly — never mix conventions within a category, and never introduce a new one without updating this table.

| Type | Convention | Example |
|---|---|---|
| Page folders (admin) | PascalCase + `Page` suffix, `index.tsx` inside | `UserManagementPage/index.tsx` |
| Page folders (vendor) | PascalCase, `Vendor` prefix, no `Page` suffix, `index.tsx` inside | `vendor/VendorProducts/index.tsx` |
| Auth/misc page folders | PascalCase, `index.tsx` inside (same folder-per-page rule as above) | `auth/Login/index.tsx` |
| React components | PascalCase | `StatsCard.tsx`, `DashboardLayout.tsx` |
| shadcn/ui primitives (`components/ui/`, unwrapped) | lowercase (shadcn CLI default — don't rename) | `button.tsx`, `dialog.tsx` |
| Hooks | camelCase + `use` prefix | `useAuth.ts` |
| Utilities (`lib/`) | camelCase | `utils.ts`, `ratings.ts` |
| Data/mock modules (`data/`) | camelCase | `products.ts` |
| Types | lowercase `types.ts`, co-located with its component/module | `DataTable/types.ts` |
| Constants | single file, no fragmentation | `constants/index.ts` |
| Redux slices | camelCase + `Slice` suffix | `authSlice.ts` |
| Contexts/providers | PascalCase + `Provider` suffix | `ThemeProvider.tsx` |
| Tests (when added) | co-located, same name + `.test` | `StatsCard.test.tsx` |

Every page — admin, vendor, or auth — lives in its own folder with `index.tsx`, never a bare `PageName.tsx` file. This was inconsistent in `pages/auth/*` and `pages/Dashboard/Dashboard.tsx`; both were normalized to the folder/`index.tsx` form.

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

## Backend architecture (`local-be/`)

### Stack
- **NestJS 11 + TypeScript**, **MongoDB via Mongoose** (`@nestjs/mongoose`)
- **`@nestjs/passport` + `@nestjs/jwt`** — bearer-JWT auth only, no cookies/sessions
- **`@aws-sdk/client-s3`** — file uploads via presigned S3 URLs, no files pass through the API server
- **`@nestjs/swagger`** — one document, split into two UIs (see below)
- **`@nestjs/throttler`** — global default 100 req/15 min, tighter per-route via `@Throttle()` on OTP/login endpoints
- **`bcryptjs`** for password hashing, **`nodemailer`** for email, a **best-effort SMS provider** for OTP delivery

### Module structure (ports-and-adapters, per `brocoders/nestjs-boilerplate`)
Every domain module (`users`, `vendors`, `addresses`, `files`, `otp`, `products`, `refresh-tokens`, `wishlists`, `cart`, `orders`, `notifications`) follows the same shape — `users/` is the reference:
- `domain/*.ts` — plain class describing the entity as the rest of the app sees it; Swagger `@ApiProperty()` and `class-transformer` `@Exclude()`/`@Expose()` decorators live here, not on the schema
- `infrastructure/persistence/*.repository.ts` — **abstract** class defining the repository contract; services depend on this, never on Mongoose directly
- `infrastructure/persistence/document/entities/*.schema.ts` — the actual Mongoose schema, extending `EntityDocumentHelper` (`src/utils/document-entity-helper.ts`) so `_id` always serializes to a plain string
- `infrastructure/persistence/document/mappers/*.mapper.ts` — schema document ⇄ domain entity conversion
- `infrastructure/persistence/document/repositories/*.repository.ts` — concrete Mongoose implementation of the abstract repository
- `infrastructure/persistence/document/document-persistence.module.ts` — registers the Mongoose schema and binds the abstract repository token to the concrete class; this is the only persistence file a feature module imports

Swapping persistence backends means adding a new `infrastructure/persistence/<backend>/` folder and module, not touching any service.

### Config
One `registerAs` module per concern in `<module>/config/*.config.ts` (`app`, `database`, `auth`, `sms`, `email`, `file`, `adminSeed`), each with its own `class-validator` `EnvironmentVariablesValidator` run through `validateConfig()` (`src/utils/validate-config.ts`) at boot — a missing required var fails startup immediately rather than at first use. All configs are aggregated into `AllConfigType` (`src/config/config.type.ts`) and read via `ConfigService<AllConfigType>.getOrThrow('namespace.key', { infer: true })`.

### Dual auth: mobile vs dashboard
Two fully separate controllers/URL namespaces, sharing one `SessionService` for token issuance/refresh/logout/me:
- `MobileAuthController` (`/mobile/auth/*`) — pure OTP, no password, for `customer`/`driver` roles; `verify-otp` creates the account on first use (`MobileAuthResponseDto.isNewUser` tells signup from login)
- `DashboardAuthController` (`/dashboard/auth/*`) — password-only, for `vendor`/`admin` roles; includes forgot-password → verify-OTP → reset-password
- `SessionService` (`auth/session.service.ts`) issues/refreshes access+refresh JWT pairs (separate secrets and expiries, `issuer: 'beta-api'`), backed by `RefreshTokensService`, which enforces `MAX_ACTIVE_SESSIONS` by revoking the oldest session(s) on overflow
- Vendor registration (`VendorsController`, `/vendors/register` → `/vendors/verify-registration`) is a third, public OTP flow — mirrors mobile signup but creates a `Vendor` in `pending_approval` status awaiting admin approval (`AdminVendorsController`); KYC document upload (`/vendors/kyc-upload-url`) happens pre-account via `FilesS3PresignedService.createPublicUploadUrl()`

### AuthN/AuthZ on a route
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('vendor')` (any subset of `Role[]` from `common/constants/auth.constants.ts`) + `@CurrentUser() user: AuthenticatedUser` param — see any authenticated endpoint in `vendors.controller.ts`. `JwtAuthGuard` wraps Passport's `AuthGuard('jwt')` to translate auth failures into the app's `AppException` shape (`TOKEN_EXPIRED` vs `INVALID_TOKEN`) instead of Nest's default 401 body.

### Error handling
Throw `AppException` (`common/exceptions/app.exception.ts`) with a code from `common/exceptions/error-codes.ts::ERROR_CODES`, an HTTP status, and optional field-level `details` — don't throw raw Nest exceptions for app-level failures. The global `AppExceptionFilter` (`common/filters/app-exception.filter.ts`, wired as `APP_FILTER`) catches everything — `AppException`, class-validator `BadRequestException`s (remapped to 422 `VALIDATION_ERROR` with per-field details), and any other `HttpException` — into one envelope: `{ success: false, error: { code, message, details }, timestamp, path, requestId }`. Adding a new failure case means adding to `ERROR_CODES`, not inventing a new response shape.

### Response serialization
A global `ClassSerializerInterceptor` (wired in `main.ts`) strips `@Exclude()`-marked fields (e.g. `User.passwordHash`) from every response automatically — domain entities declare this once, controllers don't hand-write a `toPublic()` mapper per endpoint. Admin-only fields (e.g. `User.lastLoginIp`) use `@Expose({ groups: ['admin'] })` and only surface when a controller adds `@SerializeOptions({ groups: ['admin'] })`.

### Swagger: one scan, two docs
`main.ts` builds a single `SwaggerModule` document, then `common/swagger/filter-document-by-tags.util.ts` splits it into `/api-docs/mobile` and `/api-docs/dashboard` by `@ApiTags()` value. `MOBILE_API_TAGS`/`DASHBOARD_API_TAGS` in `common/swagger/swagger-tags.constants.ts` is the single place deciding which UI a controller's tag belongs to — no controller or route needs to be duplicated to appear in both.

### File uploads
`FilesS3PresignedService` (`files/infrastructure/uploader/s3-presigned/files.service.ts`) presigns S3 `PutObject` URLs; nothing is proxied through the API. `createUploadUrl()` (authenticated, `POST /files/upload-url`) records a `FileRepository` row so uploads are attributable to a user; `createPublicUploadUrl()` is used only pre-account (vendor KYC) and stores the resulting URL directly on the owning entity instead.

### Cart
`me/cart` (customer-only) holds items server-side pre-checkout: `Cart` is one document per user (`cart/infrastructure/persistence/document/entities/cart.schema.ts`), `items[]` an embedded subdocument array (`productId`, `storeId`, `size?`, `color?`, `qty`, `unitPrice` snapshot). `CartService` reads the whole cart, mutates the array in memory, and writes it back in one `replaceItems()` call per mutation (`cart.repository.ts`) rather than per-item atomic Mongo ops — carts are single-user, low-contention documents, so this stays simple. `subtotal`/`deliveryFee`/`total` are computed on every read (`CartService.withTotals`), never persisted; `deliveryFee` comes from the `cart` config (`CART_DELIVERY_FEE`, flat, see env vars above). Adding an item merges into an existing line with the same `productId`+`size`+`color` (incrementing `qty`, re-snapshotting `unitPrice`) instead of adding a duplicate row.

### Orders & checkout (MyFatoorah-gated)
An `Order` is only ever created **after** MyFatoorah confirms payment — never before, and never speculatively. The flow, all in `orders/`:
1. `POST /orders` (`CheckoutController`) — `OrdersService.checkout()` re-validates+re-prices every cart item against the live `Product` (status `active`, `inStock`; price re-read, never trusted from the cart snapshot), splits the cart into one draft order per vendor (`storeId`), snapshots the chosen address and each vendor's `commissionStructure.defaultPercentage`, then calls `PaymentsService.executePayment()` (MyFatoorah `ExecutePayment`) for the combined total. Only once that call succeeds is a `CheckoutSession` persisted (`orders/domain/checkout-session.ts`) — a frozen pending-checkout record keyed by MyFatoorah's own `InvoiceId`, holding everything needed to create the real order(s) later without re-touching the cart or re-pricing. The response is a `paymentUrl` for the client to open in a webview; no `Order` exists yet.
2. MyFatoorah redirects the browser to `GET /payments/myfatoorah/callback` (success) or `/error` (failure/cancel) with a `paymentId` query param (`PaymentCallbackController`, public, no `JwtAuthGuard` — MyFatoorah is calling it, not our client). Both routes are identical and just call `OrdersService.finalizeCheckout(paymentId)`, which never trusts which URL was hit and instead re-verifies via `PaymentsService.getPaymentStatus()` (MyFatoorah `GetPaymentStatus`). If not paid: the `CheckoutSession` is marked `failed` and nothing else happens — no `Order` was ever created, and the cart was never touched, so the items are simply still there to retry. If paid: one `Order` per vendor draft is created (`status: 'confirmed'`, `paymentStatus: 'paid'`, `statusHistory` seeded with both `placed` (session creation time) and `confirmed` (now)), the purchased cart items are removed (`CartService.removeItems`, not a full clear — items added since checkout was initiated survive), and a confirmation email is sent. This handler is idempotent — a redelivered webhook on an already-`paid` session just returns the orders already created.

Canonical order status enum: `placed → confirmed → in_transit → delivered`, plus `cancelled` (one-directional — see `orders/orders.constants.ts` for the transition table). Since orders are only ever created already-`confirmed`, a vendor's real levers via `PATCH /vendor/orders/:id/status` (`VendorOrdersController`, vendor resolved fresh from `VendorsService.findByUserId()` per request, same precedent as `VendorProductsController`) are `in_transit` and `delivered`; resending the order's *current* status is treated as a driver-info-only update rather than an illegal transition, so a vendor can attach/correct `driver: { name, phone, photoUrl?, vehicleInfo? }` (shown on the customer's order tracking view) at any point without disturbing `statusHistory`. Customers cancel via `POST /me/orders/:id/cancel`, allowed only while `placed`/`confirmed`. `GET /me/orders?tab=active|previous|canceled` maps tabs to status groups (`TAB_STATUSES`). Admin (`AdminOrdersController`, under `admin/`) is read-only — list/detail across all vendors, no status mutation.

`PaymentsService` (`payments/`) is a thin, stateless wrapper around MyFatoorah's v2 REST API (`InitiatePayment` to list methods for `GET /me/payment-methods`, `ExecutePayment`, `GetPaymentStatus`) — no SDK, plain `fetch` + Bearer token (same style as `SmsService`). It's a leaf module with no persistence of its own; `orders/` owns the `CheckoutSession`/`Order` state and is the only module that calls it.

### Notifications & push (FCM-gated)
`notifications/` owns one collection shared by customers, vendors, and admins — `GET /me/notifications` (+ `/unread-count`, `PATCH /:id/read`, `PATCH /read-all`) carries no `@Roles()` restriction, just `JwtAuthGuard`. Every event goes through `NotificationsService.notify()`/`notifyMany()`, which writes the in-app `Notification` row first (always — this is the source of truth regardless of push outcome) and then fires a push best-effort in the background (`void`, same non-blocking precedent as `EmailService`/`SmsService`) gated on `User.notificationsEnabled` (`PATCH /me/settings/notifications {enabled}`) and the user having at least one registered FCM token.

The one rule that matters here: `notifications/notification.serializer.ts` exports a single `toNotificationPayload()` that both the list endpoint and the FCM `data` payload (via `buildFcmData()`) are built from — never a second hand-rolled shape for push, so a client deep-linking off a push tap's `data` gets exactly what the list endpoint would have returned for that same row. `PushService` (`push/`) is a thin, stateless Firebase Admin wrapper — best-effort like `SmsService`/`EmailService` (silently no-ops without `FIREBASE_*` configured, see env vars above), and prunes dead tokens (`messaging/registration-token-not-registered` etc.) via the existing `UsersService.removeFcmTokenByToken` rather than a separate device-token collection — device tokens already live embedded on `User.fcmTokens` (`POST /users/register-fcm-token`, `DELETE /users/fcm-token/:tokenId`), so there's no second source of truth to keep in sync.

`type` is one of `order_update` (customer, fired from `OrdersService` on checkout confirmation, a real vendor status transition, and customer-initiated cancellation), `new_order` (vendor, fired on checkout confirmation), `admin_message` (vendor, via `POST /admin/notifications/vendor {vendorId?, title, message}` — omitting `vendorId` broadcasts to every vendor account), and `promotion` (reserved for a future Content/banners module — no trigger source exists yet).

### Adding a new module
Follow the `users`/`vendors` shape above: `domain/`, `infrastructure/persistence/` (abstract) + `infrastructure/persistence/document/` (schema, mapper, concrete repository, persistence module), a `*.service.ts` depending on the abstract repository, a `*.controller.ts` tagged with `@ApiTags()` and added to `MOBILE_API_TAGS`/`DASHBOARD_API_TAGS`, and a `*.module.ts` registered in `AppModule`.
