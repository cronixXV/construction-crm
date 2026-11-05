import type { ReactNode } from "react";
import { Badge, Card, Heading, Stack, Text } from "@chakra-ui/react";
import { statusColors, statusLabels } from "@/shared/consts/consts";
import type { ITask } from "../model/types/types";

interface ITaskCardProps {
  task: ITask;
  meta?: ReactNode;
  actions?: ReactNode;
}

export const TaskCard = ({ task, meta, actions }: ITaskCardProps) => (
  <Card.Root variant="outline">
    <Card.Body>
      <Stack gap="3">
        <Heading size="md">{task.title}</Heading>
        {task.description && <Text color="fg.muted">{task.description}</Text>}
        <Badge colorPalette={statusColors[task.status]} width="fit-content">
          {statusLabels[task.status]}
        </Badge>
        {meta}
        <Text fontSize="sm" color="fg.muted">
          Создана: {new Date(task.created_at).toLocaleDateString("ru-RU")}
        </Text>
        {actions}
      </Stack>
    </Card.Body>
  </Card.Root>
);
