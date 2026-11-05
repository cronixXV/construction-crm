import { useParams } from "react-router-dom";
import {
  Badge,
  Card,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";
import { statusLabels } from "@/shared/consts/consts";

import { useObjectById } from "@/entities/object";
import { useObjectTasks } from "@/entities/task";
import { CreateTaskForm } from "@/features/create-task";
import { ChangeTaskAssigneeForm } from "@/features/change-task-assignee";

export const ObjectDetailsPage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const { profile } = useAuth();

  const objectQuery = useObjectById(objectId ?? "");
  const tasksQuery = useObjectTasks(objectId ?? "");

  if (objectQuery.isPending || tasksQuery.isPending) {
    return <Text>Загрузка объекта...</Text>;
  }

  if (objectQuery.isError) {
    return (
      <Text color="red.500">
        Не удалось загрузить объект: {objectQuery.error.message}
      </Text>
    );
  }

  if (tasksQuery.isError) {
    return (
      <Text color="red.500">
        Не удалось загрузить задачи: {tasksQuery.error.message}
      </Text>
    );
  }

  const object = objectQuery.data;
  const tasks = tasksQuery.data;

  return (
    <Stack gap="6">
      <Stack gap="2">
        <Heading size="xl">{object.name}</Heading>
        <Text color="fg.muted">{object.address}</Text>
      </Stack>

      {profile?.role === "manager" && (
        <Card.Root variant="outline">
          <Card.Header>
            <Heading size="md">Создать задачу</Heading>
          </Card.Header>

          <Card.Body>
            <CreateTaskForm objectId={object.id} />
          </Card.Body>
        </Card.Root>
      )}

      <Heading size="lg">Задачи объекта</Heading>

      {tasks.length === 0 ? (
        <Text color="fg.muted">Для этого объекта пока нет задач.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {tasks.map((task) => (
            <Card.Root key={task.id} variant="outline">
              <Card.Body>
                <Stack gap="3">
                  <Heading size="md">{task.title}</Heading>

                  {task.description && (
                    <Text color="fg.muted">{task.description}</Text>
                  )}

                  <Badge colorPalette="blue">{statusLabels[task.status]}</Badge>

                  <Text fontSize="sm" color="fg.muted">
                    Исполнитель: {task.assignee_id}
                  </Text>

                  <Text fontSize="sm" color="fg.muted">
                    Создана:{" "}
                    {new Date(task.created_at).toLocaleDateString("ru-RU")}
                  </Text>

                  {profile?.role === "manager" && (
                    <ChangeTaskAssigneeForm
                      taskId={task.id}
                      objectId={task.object_id}
                      currentAssigneeId={task.assignee_id}
                    />
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};
