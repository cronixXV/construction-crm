import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";

import { useCreateTask } from "../api/use-create-task";
import {
  createTaskSchema,
  type TCreateTaskValues,
} from "../model/schemas/create-task-schema";

import { useAuth } from "@/app/providers/auth/use-auth";
import { useExecutors } from "@/entities/user";

interface ICreateTaskFormProps {
  objectId: string;
}

export const CreateTaskForm = ({ objectId }: ICreateTaskFormProps) => {
  const { session } = useAuth();
  const executorsQuery = useExecutors();
  const createTaskMutation = useCreateTask();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TCreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
    },
  });

  const onSubmit = async (values: TCreateTaskValues) => {
    setSuccessMessage(null);

    if (!session) return;

    try {
      await createTaskMutation.mutateAsync({
        ...values,
        objectId,
        authorId: session.user.id,
      });

      reset();
      setSuccessMessage("Задача успешно создана.");
    } catch {
      return;
    }
  };

  if (executorsQuery.isPending) {
    return <Text>Загрузка исполнителей...</Text>;
  }

  if (executorsQuery.isError) {
    return (
      <Text color="red.500">Не удалось загрузить список исполнителей.</Text>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root invalid={!!errors.title}>
          <Field.Label>Название задачи</Field.Label>
          <Input placeholder="Подготовить фундамент" {...register("title")} />
          <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.description}>
          <Field.Label>Описание</Field.Label>
          <Textarea
            placeholder="Опишите, что необходимо сделать"
            {...register("description")}
          />
          <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.assigneeId}>
          <Field.Label>Исполнитель</Field.Label>

          <NativeSelect.Root>
            <NativeSelect.Field {...register("assigneeId")}>
              <option value="">Выберите исполнителя</option>

              {executorsQuery.data.map((executor) => (
                <option key={executor.id} value={executor.id}>
                  {executor.full_name || executor.email}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <Field.ErrorText>{errors.assigneeId?.message}</Field.ErrorText>
        </Field.Root>

        {createTaskMutation.isError && (
          <Text color="red.500">
            Не удалось создать задачу. Попробуйте ещё раз.
          </Text>
        )}

        {successMessage && <Text color="green.500">{successMessage}</Text>}

        <Button
          type="submit"
          loading={isSubmitting || createTaskMutation.isPending}
          disabled={isSubmitting || createTaskMutation.isPending}
        >
          Создать задачу
        </Button>
      </Stack>
    </form>
  );
};
