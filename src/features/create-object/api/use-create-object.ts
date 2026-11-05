import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createObject, objectKeys } from "@/entities/object";

export const useCreateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createObject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: objectKeys.all,
      });
    },
  });
};
