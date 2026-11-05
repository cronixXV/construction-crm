import { useState } from "react";
import { Button, Field, NativeSelect, Stack, Text } from "@chakra-ui/react";

import { useChangeTaskAssignee } from "../api/use-change-task-assignee";

import { useExecutors } from "@/entities/user";

interface IChangeTaskAssigneeFormProps {
  taskId: string;
  objectId: string;
  currentAssigneeId: string;
}

export const ChangeTaskAssigneeForm = ({
  taskId,
  objectId,
  currentAssigneeId,
}: IChangeTaskAssigneeFormProps) => {
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: executors = [],
    isLoading: isExecutorsLoading,
    error: executorsError,
  } = useExecutors();

  const changeTaskAssigneeMutation = useChangeTaskAssignee();

  const handleSubmit = () => {
    if (assigneeId === currentAssigneeId) return;

    changeTaskAssigneeMutation.mutate(
      {
        taskId,
        objectId,
        assigneeId,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Исполнитель изменён");
        },
      }
    );
  };

  const handleAssigneeChange = (value: string) => {
    setAssigneeId(value);
    setSuccessMessage("");
    changeTaskAssigneeMutation.reset();
  };

  if (isExecutorsLoading) {
    return <Text fontSize="sm">Загрузка исполнителей...</Text>;
  }

  if (executorsError) {
    return (
      <Text color="red.500" fontSize="sm">
        Не удалось загрузить список исполнителей
      </Text>
    );
  }

  return (
    <Stack gap={3}>
      <Field.Root>
        <Field.Label>Исполнитель</Field.Label>

        <NativeSelect.Root>
          <NativeSelect.Field
            value={assigneeId}
            onChange={(event) => handleAssigneeChange(event.target.value)}
          >
            {executors.map((executor) => (
              <option key={executor.id} value={executor.id}>
                {executor.full_name || executor.email}
              </option>
            ))}
          </NativeSelect.Field>

          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Button
        onClick={handleSubmit}
        loading={changeTaskAssigneeMutation.isPending}
        disabled={
          assigneeId === currentAssigneeId ||
          changeTaskAssigneeMutation.isPending ||
          executors.length === 0
        }
      >
        Сохранить
      </Button>

      {successMessage && (
        <Text color="green.500" fontSize="sm">
          {successMessage}
        </Text>
      )}

      {changeTaskAssigneeMutation.isError && (
        <Text color="red.500" fontSize="sm">
          Не удалось изменить исполнителя. Попробуйте ещё раз.
        </Text>
      )}
    </Stack>
  );
};
