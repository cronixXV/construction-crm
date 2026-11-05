import { useParams } from "react-router-dom";
import { Badge, Card, Heading, Stack, Text } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";
import { statusColors, statusLabels } from "@/shared/consts/consts";

import { ChangeTaskStatusActions } from "@/features/change-task-status";
import { TaskStatusHistory, useTaskById } from "@/entities/task";
import { ObjectCard, useObjectById } from "@/entities/object";

export const TaskDetailsPage = () => {
  const { profile } = useAuth();
  const { taskId } = useParams<{ taskId: string }>();

  const taskQuery = useTaskById(taskId ?? "");
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
          <ObjectCard object={object} />
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">История изменений</Heading>
        </Card.Header>

        <Card.Body>
          <TaskStatusHistory taskId={task.id} />
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};
