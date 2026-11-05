import { Box, Center, Heading, Spinner, Text, VStack } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";
import { RoleRedirect } from "@/app/routers/role-redirect";

import { LoginForm } from "@/features/auth/ui/login-form";

export const LoginPage = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (session) {
    return <RoleRedirect />;
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="4"
    >
      <Box width="100%" maxW="400px" p="8" borderWidth="1px" borderRadius="lg">
        <VStack gap="6" align="stretch">
          <Box>
            <Heading size="xl">Construction CRM</Heading>
            <Text color="gray.500" mt="2">
              Войдите в свою учётную запись
            </Text>
          </Box>

          <LoginForm />
        </VStack>
      </Box>
    </Box>
  );
};
