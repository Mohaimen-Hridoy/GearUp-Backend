import { z } from "zod";
import { cuidIdSchema } from "../gear/gear.validation";

export const paymentIdParamsSchema = z.object({
  params: z.object({
    id: cuidIdSchema,
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: cuidIdSchema,
  }),
});

export const confirmPaymentSchema = z.object({
  body: z
    .object({
      transactionId: z.string().min(1).optional(),
      rentalOrderId: cuidIdSchema.optional(),
      paymentIntentId: z.string().min(1, "paymentIntentId is required").optional(),
    })
    .refine((value) => value.transactionId || value.rentalOrderId, {
      message: "Either transactionId or rentalOrderId is required",
      path: ["transactionId"],
    }),
});
