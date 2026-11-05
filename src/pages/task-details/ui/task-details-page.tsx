import { useParams } from "react-router-dom";
import { Badge, Card, Heading, Separator, Stack, Text } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";
import { statusColors, statusLabels } from "@/shared/consts/consts";

import { ChangeTaskStatusActions } from "@/features/change-task-status";
import { useTaskById, useTaskStatusHistory } from "@/entities/task";
import { useObjectById } from "@/entities/object";

export const TaskDetailsPage = () => {
  const { profile } = useAuth();
  const { taskId } = useParams<{ taskId: string }>();

  const taskQuery = useTaskById(taskId ?? "");
  const historyQuery = useTaskStatusHistory(taskId ?? "");
  const objectQuery = useObjectById(taskQuery.data?.object_id ?? "");

  if (taskQuery.isPending) {
    return <Text>Загрузка задачи...</Text>;
  }

  if (taskQuery.isError) {
    return (
      <Text color="red.500">
        Не удалось загрузить задачу. Возможно, она не существует или у вас нет
        доступа.
      </Text>
    );
  }

  if (objectQuery.isPending) {
    return <Text>Загрузка информации об объекте...</Text>;
  }

  if (objectQuery.isError) {
    return (
      <Text color="red.500">Не удалось загрузить информацию об объекте.</Text>
    );
  }

  const task = taskQuery.data;
  const object = objectQuery.data;

  return (
    <Stack gap="6">
      <Stack gap="2">
        <Heading size="xl">{task.title}</Heading>

        <Badge colorPalette={statusColors[task.status]} width="fit-content">
          {statusLabels[task.status]}
        </Badge>
      </Stack>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">Информация о задаче</Heading>
        </Card.Header>

        <Card.Body>
          <Stack gap="3">
            <Stack gap="1">
              <Text fontWeight="medium">Описание</Text>
              <Text color="fg.muted">
                {task.description || "Описание отсутствует"}
              </Text>
            </Stack>

            <Stack gap="1">
              <Text fontWeight="medium">Исполнитель</Text>
              <Text color="fg.muted">{task.assignee_id}</Text>
            </Stack>

            <Stack gap="1">
              <Text fontWeight="medium">Автор задачи</Text>
              <Text color="fg.muted">{task.author_id}</Text>
            </Stack>

            <Stack gap="1">
              <Text fontWeight="medium">Дата создания</Text>
              <Text color="fg.muted">
                {new Date(task.created_at).toLocaleString("ru-RU")}
              </Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>

      {profile && (
        <Card.Root variant="outline">
          <Card.Header>
            <Heading size="md">Действия с задачей</Heading>
          </Card.Header>

          <Card.Body>
            <ChangeTaskStatusActions
              taskId={task.id}
              objectId={task.object_id}
              assigneeId={task.assignee_id}
              status={task.status}
              role={profile.role}
            />
          </Card.Body>
        </Card.Root>
      )}

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">Объект</Heading>
        </Card.Header>

        <Card.Body>
          <Stack gap="2">
            <Heading size="sm">{object.name}</Heading>
            <Text color="fg.muted">{object.address}</Text>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">История изменений</Heading>
        </Card.Header>

        <Card.Body>
          {historyQuery.isPending ? (
            <Text>Загрузка истории...</Text>
          ) : historyQuery.isError ? (
            <Text color="red.500">Не удалось загрузить историю изменений.</Text>
          ) : historyQuery.data.length === 0 ? (
            <Text color="fg.muted">История изменений пока пуста.</Text>
          ) : (
            <Stack gap="3">
              {historyQuery.data.map((item, index) => (
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

                  {index !== historyQuery.data.length - 1 && <Separator />}
                </Stack>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};
