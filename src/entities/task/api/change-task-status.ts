import { supabase } from "@/shared/api/client";

import type { TTaskStatus } from "../model/types/types";

interface IChangeTaskStatusInput {
  taskId: string;
  newStatus: TTaskStatus;
  comment?: string | null;
}

export const changeTaskStatus = async ({
  taskId,
  newStatus,
  comment = null,
}: IChangeTaskStatusInput): Promise<void> => {
  const { error } = await supabase.rpc("change_task_status", {
    p_task_id: taskId,
    p_new_status: newStatus,
    p_comment: comment,
  });

  if (error) {
    throw error;
  }
};
