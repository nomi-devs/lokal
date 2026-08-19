// routers/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../store";

import { roleHome } from "./roleHome";

interface Props {
  children: React.ReactNode;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
