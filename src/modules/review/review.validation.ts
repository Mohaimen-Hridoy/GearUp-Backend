import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    gearItemId: z.string().min(1, "Gear item ID is required"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});
