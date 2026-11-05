import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/auth/use-auth";

export const RoleRedirect = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === "manager") {
    return <Navigate to="/objects" replace />;
  }

  return <Navigate to="/my-tasks" replace />;
};
