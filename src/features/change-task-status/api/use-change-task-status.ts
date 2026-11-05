import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeTaskStatus, taskKeys } from "@/entities/task";

interface IChangeTaskStatusInput {
  taskId: string;
  objectId: string;
  assigneeId: string;
  newStatus: "new" | "in_progress" | "review" | "accepted" | "revision";
  comment?: string | null;
}

export const useChangeTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, newStatus, comment }: IChangeTaskStatusInput) =>
      changeTaskStatus({ taskId, newStatus, comment }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, "detail", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: [...taskKeys.all, "history", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: taskKeys.byObject(variables.objectId),
      });

      queryClient.invalidateQueries({
        queryKey: taskKeys.byAssignee(variables.assigneeId),
      });
    },
  });
};
