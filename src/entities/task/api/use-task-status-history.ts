import { useQuery } from "@tanstack/react-query";

import { getTaskStatusHistory } from "./get-task-status-history";
import { taskKeys } from "./use-object-tasks";

export const useTaskStatusHistory = (taskId: string) =>
  useQuery({
    queryKey: [...taskKeys.all, "history", taskId],
    queryFn: () => getTaskStatusHistory(taskId),
    enabled: Boolean(taskId),
  });
