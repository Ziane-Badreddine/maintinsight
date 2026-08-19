import { z } from "zod";

export const createPlantSchema = z.object({
  cityId: z.number().int().positive(),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Code must be at least 2 characters."),
  description: z.string().trim().optional(),
});

export type CreatePlantInput = z.infer<typeof createPlantSchema>;
