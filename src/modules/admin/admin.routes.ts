import { Role } from "@prisma/client";
import { Router } from "express";
import {
  getAdminGear,
  getAdminRentals,
  getUsers,
  updateUserStatus,
} from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminUserIdParamsSchema, updateUserStatusSchema } from "./admin.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), getUsers);
router.patch("/users/:id", auth(Role.ADMIN), validateRequest(adminUserIdParamsSchema), validateRequest(updateUserStatusSchema), updateUserStatus);
router.get("/gear", auth(Role.ADMIN), getAdminGear);
router.get("/rentals", auth(Role.ADMIN), getAdminRentals);

export const adminRoutes = router;
