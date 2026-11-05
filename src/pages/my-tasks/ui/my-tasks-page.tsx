import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";
import { statusColors, statusLabels } from "@/shared/consts/consts";

import { useMyTasks } from "@/entities/task";

export const MyTasksPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const tasksQuery = useMyTasks(session?.user.id ?? "");

  if (tasksQuery.isPending) {
    return <Text>Загрузка задач...</Text>;
  }

  if (tasksQuery.isError) {
    return (
      <Text color="red.500">
        Не удалось загрузить задачи: {tasksQuery.error.message}
      </Text>
    );
  }

  const tasks = tasksQuery.data;

  return (
    <Stack gap="6">
      <Heading size="xl">Мои задачи</Heading>

      {tasks.length === 0 ? (
        <Text color="fg.muted">У вас пока нет назначенных задач.</Text>
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

                  <Badge colorPalette={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>

                  <Text fontSize="sm" color="fg.muted">
                    Объект: {task.object_id}
                  </Text>

                  <Text fontSize="sm" color="fg.muted">
                    Создана:{" "}
                    {new Date(task.created_at).toLocaleDateString("ru-RU")}
                  </Text>
                </Stack>

                <Button
                  variant="outline"
                  width="100%"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  Открыть задачу
                </Button>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};
