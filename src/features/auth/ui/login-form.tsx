import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Stack } from "@chakra-ui/react";

import {
  loginSchema,
  type TLoginFormValues,
} from "../model/schemas/login-schema";

import { useAuth } from "@/app/providers/auth/use-auth";

export const LoginForm = () => {
  const { signIn } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: TLoginFormValues) => {
    setServerError(null);

    try {
      await signIn(values.email, values.password);
    } catch {
      setServerError("Не удалось войти. Проверьте email и пароль.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root invalid={!!errors.email}>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            placeholder="manager@test.com"
            autoComplete="username"
            {...register("email")}
          />
          <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.password}>
          <Field.Label>Пароль</Field.Label>
          <Input
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        {serverError && (
          <Field.Root invalid>
            <Field.ErrorText>{serverError}</Field.ErrorText>
          </Field.Root>
        )}

        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Войти
        </Button>
      </Stack>
    </form>
  );
};
