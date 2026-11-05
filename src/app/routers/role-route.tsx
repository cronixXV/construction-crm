import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/auth/use-auth";

import type { TUserRole } from "@/entities/user";

interface IRoleRouteProps {
  allowedRoles: TUserRole[];
}

export const RoleRoute = ({ allowedRoles }: IRoleRouteProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <p>Загрузка профиля...</p>;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
