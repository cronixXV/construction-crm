import { Separator, Stack, Text } from "@chakra-ui/react";
import { statusLabels } from "@/shared/consts/consts";
import { useTaskStatusHistory } from "../api/use-task-status-history";

export const TaskStatusHistory = ({ taskId }: { taskId: string }) => {
  const { data, isPending, isError } = useTaskStatusHistory(taskId);

  if (isPending) return <Text>Загрузка истории...</Text>;

  if (isError)
    return <Text color="red.500">Не удалось загрузить историю изменений.</Text>;

  if (data.length === 0)
    return <Text color="fg.muted">История изменений пока пуста.</Text>;

  return (
    <Stack gap="3">
      {data.map((item, index) => (
        <Stack key={item.id} gap="3">
          <Stack gap="2">
            <Text fontWeight="medium">
              {item.old_status
                ? statusLabels[item.old_status]
                : "Создание задачи"}
              {" → "}
              {statusLabels[item.new_status]}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Кто изменил: {item.changed_by}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {new Date(item.created_at).toLocaleString("ru-RU")}
            </Text>
            {item.comment && (
              <Text fontSize="sm">Комментарий: {item.comment}</Text>
            )}
          </Stack>
          {index !== data.length - 1 && <Separator />}
        </Stack>
      ))}
    </Stack>
  );
};
