// /routers/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../store";

import { roleHome } from "./roleHome";

interface Props {
  children: React.ReactNode;
  /** When set, only these roles may render this route; other roles are sent to their own home. */
  allowedRoles?: ("admin" | "vendor")[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
