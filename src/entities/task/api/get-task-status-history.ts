import { supabase } from "@/shared/api/client";

import type { ITaskStatusHistory } from "../model/types/types";

export const getTaskStatusHistory = async (
  taskId: string
): Promise<ITaskStatusHistory[]> => {
  const { data, error } = await supabase
    .from("task_status_history")
    .select(
      "id, task_id, changed_by, old_status, new_status, comment, created_at"
    )
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};
