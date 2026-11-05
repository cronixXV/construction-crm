import { useQuery } from "@tanstack/react-query";

import { getTaskById } from "./get-task-by-id";
import { taskKeys } from "./use-object-tasks";

export const useTaskById = (taskId: string) =>
  useQuery({
    queryKey: [...taskKeys.all, "detail", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId),
  });
