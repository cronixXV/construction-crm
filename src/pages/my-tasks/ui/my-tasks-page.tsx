import { useNavigate } from "react-router-dom";
import { Button, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";

import { useAuth } from "@/app/providers/auth/use-auth";

import { TaskCard, useMyTasks } from "@/entities/task";

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
            <TaskCard
              key={task.id}
              task={task}
              meta={
                <Text fontSize="sm" color="fg.muted">
                  Объект: {task.object_id}
                </Text>
              }
              actions={
                <Button
                  variant="outline"
                  width="100%"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  Открыть задачу
                </Button>
              }
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};
