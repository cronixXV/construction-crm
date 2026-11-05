import { useQuery } from "@tanstack/react-query";

import { getObjects } from "../api/objects-api";

export const objectKeys = {
  all: ["objects"] as const,
};

export const useObjects = () => {
  return useQuery({
    queryKey: objectKeys.all,
    queryFn: getObjects,
  });
};
