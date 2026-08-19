import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { roleHome } from "./roleHome";

import type { RootState } from "@/store";

/** Root ("/") redirect target — sends each authenticated role to its own dashboard. */
export default function RoleHomeRedirect() {
  const user = useSelector((state: RootState) => state.auth.user);

  return <Navigate to={roleHome(user?.role)} replace />;
}
