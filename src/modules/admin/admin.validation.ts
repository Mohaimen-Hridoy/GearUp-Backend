import { UserStatus } from "@prisma/client";
import { z } from "zod";
import { cuidIdSchema } from "../gear/gear.validation";

export const adminUserIdParamsSchema = z.object({
  params: z.object({
    id: cuidIdSchema,
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
  }),
});
