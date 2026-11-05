import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Stack, Text } from "@chakra-ui/react";

import { useUpdateObject } from "../api/use-update-object";

import type { IObject } from "@/entities/object";
import {
  createObjectSchema,
  type TCreateObjectValues,
} from "@/features/create-object";

interface IEditObjectFormProps {
  object: IObject;
  onSuccess: () => void;
}

export const EditObjectForm = ({ object, onSuccess }: IEditObjectFormProps) => {
  const updateObjectMutation = useUpdateObject();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TCreateObjectValues>({
    resolver: zodResolver(createObjectSchema),
    defaultValues: {
      name: object.name,
      address: object.address,
    },
  });

  const onSubmit = async (values: TCreateObjectValues) => {
    setErrorMessage(null);

    try {
      await updateObjectMutation.mutateAsync({
        id: object.id,
        ...values,
      });

      onSuccess();
    } catch {
      setErrorMessage("Не удалось сохранить изменения. Попробуйте ещё раз.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root invalid={!!errors.name}>
          <Field.Label>Название объекта</Field.Label>
          <Input {...register("name")} />
          <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.address}>
          <Field.Label>Адрес объекта</Field.Label>
          <Input {...register("address")} />
          <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
        </Field.Root>

        {errorMessage && <Text color="red.500">{errorMessage}</Text>}

        <Button
          type="submit"
          loading={isSubmitting || updateObjectMutation.isPending}
          disabled={isSubmitting || updateObjectMutation.isPending}
        >
          Сохранить изменения
        </Button>
      </Stack>
    </form>
  );
};
