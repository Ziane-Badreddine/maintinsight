import { z } from "zod";

export const inspectionCommentSchema = z.object({
  comment: z.string().max(2000).optional().nullable(),
});

export type InspectionCommentInput = z.infer<typeof inspectionCommentSchema>;
