/**
 * App-wide configuration — change these values to rebrand the template.
 * Every component that shows the app name, logo, or redirects reads from here.
 *
 * LOGO: set logo to any path under /public (served at root) or a remote URL:
 *       logo: "/logo.png"
 *       logo: "https://cdn.example.com/logo.svg"
 *
 * showLogo / showName combine independently: logo only, name only, both, or neither.
 */
export const APP_CONFIG = {
  name: "LOKAL", // shown in sidebar when showName is true
  showName: true, // false = logo only, true = logo + name
  logo: "/logo.png", // ← swap this path to change the logo everywhere
  showLogo: false, // false = name only (or nothing, if showName is also false), true = show logo
};

export const AUTH_CONFIG = {
  /** Where to land after a successful login — actual redirect is role-based, see src/routes/roleHome.ts */
  loginRedirect: "/admin/overview",
  /** Where to land after logout (handled by PublicRoute) */
  logoutRedirect: "/login",
} as const;
