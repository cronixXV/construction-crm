import { useQuery } from "@tanstack/react-query";

import { getExecutors } from "./users-api";

export const userKeys = {
  all: ["users"] as const,
  executors: () => [...userKeys.all, "executors"] as const,
};

export const useExecutors = () =>
  useQuery({
    queryKey: userKeys.executors(),
    queryFn: getExecutors,
  });
