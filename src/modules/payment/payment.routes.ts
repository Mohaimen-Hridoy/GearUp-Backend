import { Role } from "@prisma/client";
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { confirmPaymentSchema, createPaymentSchema, paymentIdParamsSchema } from "./payment.validation";
import {
  confirmPayment,
  createPayment,
  getPaymentById,
  getPayments,
} from "./payment.controller";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), validateRequest(createPaymentSchema), createPayment);
router.post("/confirm", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(confirmPaymentSchema), confirmPayment);
router.get("/", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), getPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), validateRequest(paymentIdParamsSchema), getPaymentById);

export const paymentRoutes = router;
