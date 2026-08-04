import { RentalOrderStatus } from "@prisma/client";
import { z } from "zod";
import { cuidIdSchema } from "../gear/gear.validation";

export const rentalOrderIdParamsSchema = z.object({
  params: z.object({
    id: cuidIdSchema,
  }),
});

export const createRentalSchema = z.object({
  body: z.object({
    gearItemId: cuidIdSchema,
    startDate: z.string().datetime("startDate must be an ISO datetime"),
    endDate: z.string().datetime("endDate must be an ISO datetime"),
  }),
});

export const updateRentalStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      RentalOrderStatus.CONFIRMED,
      RentalOrderStatus.CANCELLED,
      RentalOrderStatus.PICKED_UP,
      RentalOrderStatus.RETURNED,
    ]),
  }),
});
