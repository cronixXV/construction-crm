import { useQuery } from "@tanstack/react-query";

import { getTasksByObjectId } from "./get-tasks-by-object-id";

export const taskKeys = {
  all: ["tasks"] as const,
  byObject: (objectId: string) =>
    [...taskKeys.all, "object", objectId] as const,
  byAssignee: (userId: string) =>
    [...taskKeys.all, "assignee", userId] as const,
};

export const useObjectTasks = (objectId: string) =>
  useQuery({
    queryKey: taskKeys.byObject(objectId),
    queryFn: () => getTasksByObjectId(objectId),
    enabled: Boolean(objectId),
  });
