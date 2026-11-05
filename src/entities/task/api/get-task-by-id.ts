import { supabase } from "@/shared/api/client";

import type { ITask } from "../model/types/types";

export const getTaskById = async (taskId: string): Promise<ITask> => {
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
    .eq("id", taskId)
    .single();

  if (error) throw error;

  return data;
};
