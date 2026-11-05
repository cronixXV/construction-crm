import { z } from "zod";

export const createObjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Введите название объекта")
    .max(150, "Максимум 150 символов"),
  address: z
    .string()
    .trim()
    .min(1, "Введите адрес объекта")
    .max(300, "Максимум 300 символов"),
});

export type TCreateObjectValues = z.infer<typeof createObjectSchema>;
