import { useQuery } from "@tanstack/react-query";

import { getObjectById } from "./objects-api";

export const objectKeys = {
  all: ["objects"] as const,
  detail: (id: string) => [...objectKeys.all, id] as const,
};

export const useObjectById = (id: string) =>
  useQuery({
    queryKey: objectKeys.detail(id),
    queryFn: () => getObjectById(id),
    enabled: Boolean(id),
  });
