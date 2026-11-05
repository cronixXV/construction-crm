import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateObject, objectKeys } from "@/entities/object";

export const useUpdateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.all });
    },
  });
};
