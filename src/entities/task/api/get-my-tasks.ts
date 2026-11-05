import { supabase } from "@/shared/api/client";

import type { ITask } from "../model/types/types";

export const getMyTasks = async (userId: string): Promise<ITask[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      object_id,
      assignee_id,
      author_id,
      status,
      created_at
    `
    )
    .eq("assignee_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};
