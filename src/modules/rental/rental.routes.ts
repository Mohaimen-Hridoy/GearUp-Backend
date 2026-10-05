import { Role } from "@prisma/client";
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRentalSchema, rentalOrderIdParamsSchema, updateRentalStatusSchema } from "./rental.validation";
import {
  createRental,
  getRentalById,
  getRentals,
  updateRentalStatus,
  cancelRental,
} from "./rental.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validateRequest(createRentalSchema), createRental);
router.get("/", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), getRentals);
router.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), validateRequest(rentalOrderIdParamsSchema), getRentalById);
router.patch("/:id/cancel", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), validateRequest(rentalOrderIdParamsSchema), cancelRental);
router.patch("/:id", auth(Role.PROVIDER, Role.ADMIN), validateRequest(rentalOrderIdParamsSchema), validateRequest(updateRentalStatusSchema), updateRentalStatus);

export const rentalRoutes = router;
