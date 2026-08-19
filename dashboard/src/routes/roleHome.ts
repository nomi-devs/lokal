// Where each role lands after login / when it hits a route it can't access.
export function roleHome(role?: "admin" | "user" | "vendor") {
  if (role === "admin") {
    return "/admin/overview";
  }

  if (role === "vendor") {
    return "/vendor/dashboard";
  }

  return "/login";
}
