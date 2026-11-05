import { supabase } from "@/shared/api/client";

import type { ITask } from "../model/types/types";

interface ICreateTaskInput {
  title: string;
  description: string;
  objectId: string;
  assigneeId: string;
  authorId: string;
}

interface IUpdateTaskAssigneeInput {
  taskId: string;
  assigneeId: string;
}

export const createTask = async ({
  title,
  description,
  objectId,
  assigneeId,
  authorId,
}: ICreateTaskInput): Promise<ITask> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: description || null,
      object_id: objectId,
      assignee_id: assigneeId,
      author_id: authorId,
      status: "new",
    })
    .select(
      "id, title, description, object_id, assignee_id, author_id, status, created_at"
    )
    .single();

  if (error) throw error;

  return data;
};

export const updateTaskAssignee = async ({
  taskId,
  assigneeId,
}: IUpdateTaskAssigneeInput): Promise<ITask> => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", taskId)
    .select(
      "id, title, description, object_id, assignee_id, author_id, status, created_at"
    )
    .single();

  if (error) throw error;

  return data;
};
