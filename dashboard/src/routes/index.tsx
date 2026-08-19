// /routers/index.tsx

import { Routes, Route } from "react-router-dom";

import { routes } from "./config";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import NotFoundPage from "@/pages/NotFoundPage";

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map(({ path, element, protected: isProtected, publicOnly, role }) => {
        let finalElement = element;

        if (isProtected) {
          finalElement = (
            <ProtectedRoute allowedRoles={role ? [role] : undefined}>{element}</ProtectedRoute>
          );
        } else if (publicOnly) {
          finalElement = <PublicRoute>{element}</PublicRoute>;
        }

        return <Route key={path} path={path} element={finalElement} />;
      })}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
