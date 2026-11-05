import { Navigate, Outlet } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";

export const ProtectedRoute = () => {
  const { session, profile, profileError, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileError) {
    return <p>{profileError} Обновите страницу и попробуйте снова.</p>;
  }

  if (!profile) {
    return <p>Профиль пользователя не найден. Обратитесь к администратору.</p>;
  }

  return <Outlet />;
};
