import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Введите название задачи")
    .max(150, "Максимум 150 символов"),

  description: z.string().trim().max(2000, "Максимум 2000 символов"),

  assigneeId: z.string().uuid("Выберите исполнителя"),
});

export type TCreateTaskValues = z.infer<typeof createTaskSchema>;
