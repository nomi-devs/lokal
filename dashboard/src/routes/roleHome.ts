// Where each role lands after login / when it hits a route it can't access.
// Only admin/vendor log into the dashboard — customers/drivers are OTP-only
// on the mobile app and never reach this router (see local-be's AUTH spec).
export function roleHome(role?: "admin" | "vendor") {
  if (role === "admin") {
    return "/admin/overview";
  }

  if (role === "vendor") {
    return "/vendor/dashboard";
  }

  return "/login";
}
