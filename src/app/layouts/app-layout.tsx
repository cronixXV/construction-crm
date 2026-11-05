import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";

export const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setError("Не удалось выйти из аккаунта. Попробуйте ещё раз.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Box minH="100vh">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        p="4"
        borderBottomWidth="1px"
      >
        <Heading size="lg">Construction CRM</Heading>

        <Flex align="center" gap="4">
          <Box textAlign="right">
            <Text fontWeight="medium">
              {profile?.full_name || profile?.email}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {profile?.role === "manager" ? "Менеджер" : "Исполнитель"}
            </Text>
          </Box>

          <Button
            variant="outline"
            onClick={handleSignOut}
            loading={isSigningOut}
            disabled={isSigningOut}
          >
            Выйти
          </Button>
        </Flex>
      </Flex>

      {error && (
        <Text color="red.500" p="4">
          {error}
        </Text>
      )}

      <Box p="6">
        <Outlet />
      </Box>
    </Box>
  );
};
