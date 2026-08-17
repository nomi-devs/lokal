/**
 * App-wide configuration — change these values to rebrand the template.
 * Every component that shows the app name, logo, or redirects reads from here.
 *
 * LOGO: set logo to any path under /public (served at root) or a remote URL:
 *       logo: "/logo.png"
 *       logo: "https://cdn.example.com/logo.svg"
 */
export const APP_CONFIG = {
  name: "Dashboard Kit", // shown in sidebar when showName is true
  showName: false, // false = logo only, true = logo + name
  logo: "/logo.png", // ← swap this path to change the logo everywhere
};

export const AUTH_CONFIG = {
  /** Where to land after a successful login */
  loginRedirect: "/overview",
  /** Where to land after logout (handled by PublicRoute) */
  logoutRedirect: "/login",
} as const;
