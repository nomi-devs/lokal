# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with hot reload
npm run build      # Type-check (tsc) then bundle for production
npm run lint       # Run ESLint across all TypeScript files
npm run preview    # Serve the production build locally
```

No test runner is configured.

## Purpose

This is a **dashboard template / boilerplate kit**. The goal is that any new dashboard project can start from this repo. Pages contain real working examples of every major component. When adding features, keep the template-friendly patterns: shared constants, single config file, no page-specific duplication.

## Architecture

### Stack
- **React 19 + TypeScript 6**, bundled with **Vite 8**
- **React Router v7** for client-side routing
- **Redux Toolkit** for global state (`authSlice`, `itemsSlice`)
- **React Context** (`ThemeProvider`) for light/dark mode, persisted to `localStorage`
- **Redux Persist** for auth state persistence across page reloads (localStorage key: `dashboard-kit`)
- **React Hook Form + Zod 4** for form validation
- **shadcn/ui** (Radix UI primitives) + **Tailwind CSS 4** for UI

### Single-file configuration
[src/config.ts](src/config.ts) — app name, description, version, and auth redirect paths. All components that display the app name import from here.

### Path alias
`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

### Routing
Routes are declared in [src/routes/config.tsx](src/routes/config.tsx) and rendered by [src/routes/index.tsx](src/routes/index.tsx). Each route entry has a `protected` flag:
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `PublicRoute` — redirects authenticated users to `/dashboard`
- `/` redirects to `/dashboard`; catch-all redirects to `/login`

Auth state is read from Redux (`isAuthenticated` in `authSlice`), persisted to `localStorage` via redux-persist.

### Authentication
**Mock-only**: hardcoded users in [src/constants/index.ts](src/constants/index.ts). `authSlice` validates credentials and stores `{ id, email, role }`. To swap for a real backend, replace the `login` reducer body — the routing layer is unchanged. Auth state survives page refresh via redux-persist.

### State (Redux)
Store in [src/store/index.ts](src/store/index.ts):
- `authSlice` — login, logout, register + `isAuthenticated` / `currentUser`
- `itemsSlice` — placeholder for feature data

### Layout
One active layout system in [src/components/Dashboard/](src/components/Dashboard/):
- `DashboardLayout` — entry point, wraps `DashboardProvider`
- `DesktopSidebar` — 3-state: open (w-64) → partial/icons-only (w-16) → collapsed (hidden)
- `MobileSidebar` — Sheet-based drawer, same logo/logout structure as desktop
- `Topbar` — hamburger toggle + page title + theme toggle
- `context.tsx` — `sidebarState`, `isDesktop`, `toggleSidebar`

### Sidebar items
Defined once in [src/constants/index.ts](src/constants/index.ts) as `sidebarItems` and imported by every page. Change here to update all pages simultaneously.

### Key UI components

| Component | Path | Purpose |
|---|---|---|
| `StatsCard` | `src/components/ui/StatsCard.tsx` | Configurable KPI card — variant, size, trend, loading, prefix/suffix, footer, onClick |
| `DataTable` | `src/components/ui/DataTable/` | Full table system — search, filter, sort, pagination, selection, row actions, toolbar actions, stats strip |
| `Card` | `src/components/ui/card.tsx` | Base card primitives (Card, CardHeader, CardTitle, CardContent, CardFooter) |
| `DynamicForm` | `src/components/form/DynamicForm.tsx` | Schema-driven form builder (Zod + react-hook-form) |

### Forms
[src/components/form/DynamicForm.tsx](src/components/form/DynamicForm.tsx) — pass a Zod schema and field config array; handles layout, validation, and submission.

### Theming
[src/providers/ThemeProvider.tsx](src/providers/ThemeProvider.tsx) provides `useTheme()`. Dark mode toggled via class on document root. Tailwind configured for `class`-based dark mode.

### UI Primitives
`src/components/ui/` — shadcn/ui components. `cn()` in [src/lib/utils.ts](src/lib/utils.ts) merges Tailwind classes.
