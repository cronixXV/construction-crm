import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Stack, Text } from "@chakra-ui/react";

import { useCreateObject } from "../api/use-create-object";
import {
  createObjectSchema,
  type TCreateObjectValues,
} from "../model/schemas/create-object-schema";

import { useAuth } from "@/app/providers/auth/use-auth";

export const CreateObjectForm = () => {
  const { session } = useAuth();
  const createObjectMutation = useCreateObject();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TCreateObjectValues>({
    resolver: zodResolver(createObjectSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = async (values: TCreateObjectValues) => {
    setSuccessMessage(null);

    if (!session) {
      return;
    }

    try {
      await createObjectMutation.mutateAsync({
        ...values,
        createdBy: session.user.id,
      });

      reset();
      setSuccessMessage("Объект успешно создан.");
    } catch {
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root invalid={!!errors.name}>
          <Field.Label>Название объекта</Field.Label>
          <Input placeholder="Жилой комплекс Северный" {...register("name")} />
          <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.address}>
          <Field.Label>Адрес объекта</Field.Label>
          <Input placeholder="Берлин, Teststraße 10" {...register("address")} />
          <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
        </Field.Root>

        {createObjectMutation.isError && (
          <Text color="red.500">
            Не удалось создать объект. Попробуйте ещё раз.
          </Text>
        )}

        {successMessage && <Text color="green.500">{successMessage}</Text>}

        <Button
          type="submit"
          loading={isSubmitting || createObjectMutation.isPending}
          disabled={isSubmitting || createObjectMutation.isPending}
        >
          Создать объект
        </Button>
      </Stack>
    </form>
  );
};
