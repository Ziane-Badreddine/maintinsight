import { z } from "zod";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB — sous la limite Vercel Functions (4.5MB)
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const updateAvatarSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select an image" })
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 4MB")
    .refine(
      (file) => ACCEPTED_TYPES.includes(file.type),
      "Only JPEG, PNG or WebP images are allowed",
    ),
});

export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
