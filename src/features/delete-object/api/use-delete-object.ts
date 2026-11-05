import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteObject, objectKeys } from "@/entities/object";

export const useDeleteObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.all });
    },
  });
};
