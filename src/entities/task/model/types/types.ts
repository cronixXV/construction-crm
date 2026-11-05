export type TTaskStatus =
  "new" | "in_progress" | "review" | "accepted" | "revision";

export interface ITask {
  id: string;
  title: string;
  description: string | null;
  object_id: string;
  assignee_id: string;
  author_id: string;
  status: TTaskStatus;
  created_at: string;
}

export interface ITaskStatusHistory {
  id: string;
  task_id: string;
  changed_by: string;
  old_status: TTaskStatus | null;
  new_status: TTaskStatus;
  comment: string | null;
  created_at: string;
}
