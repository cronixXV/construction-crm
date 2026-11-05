import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTaskAssignee, taskKeys } from "@/entities/task";

interface IChangeTaskAssigneeInput {
  taskId: string;
  objectId: string;
  assigneeId: string;
}

export const useChangeTaskAssignee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, assigneeId }: IChangeTaskAssigneeInput) =>
      updateTaskAssignee({ taskId, assigneeId }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byObject(variables.objectId),
      });
    },
  });
};
