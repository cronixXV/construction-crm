import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask } from "@/entities/task";
import { taskKeys } from "@/entities/task";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byObject(variables.objectId),
      });
    },
  });
};
