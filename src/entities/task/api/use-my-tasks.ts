import { useQuery } from "@tanstack/react-query";

import { getMyTasks } from "./get-my-tasks";
import { taskKeys } from "./use-object-tasks";

export const useMyTasks = (userId: string) =>
  useQuery({
    queryKey: taskKeys.byAssignee(userId),
    queryFn: () => getMyTasks(userId),
    enabled: Boolean(userId),
  });
