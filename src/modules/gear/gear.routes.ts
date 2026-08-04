import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createGear,
  deleteGear,
  getAllGear,
  getGearBookedDates,
  getGearById,
  updateGear,
} from "./gear.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createGearSchema, gearIdParamsSchema, getAllGearSchema, updateGearSchema } from "./gear.validation";

const router = Router();

router.get(
  "/",
  (req, res, next) => {
    if (req.baseUrl.includes("/provider/gear")) {
      return auth(Role.PROVIDER)(req, res, next);
    }
    next();
  },
  validateRequest(getAllGearSchema),
  getAllGear,
);
// NOTE: static-looking sub-path must be registered before the "/:id" route,
// otherwise Express would treat "booked-dates" as an :id value.
router.get("/:id/booked-dates", validateRequest(gearIdParamsSchema), getGearBookedDates);
router.get("/:id", validateRequest(gearIdParamsSchema), getGearById);
router.post("/", auth(Role.PROVIDER), validateRequest(createGearSchema), createGear);
router.put("/:id", auth(Role.PROVIDER), validateRequest(gearIdParamsSchema), validateRequest(updateGearSchema), updateGear);
router.delete("/:id", auth(Role.PROVIDER), validateRequest(gearIdParamsSchema), deleteGear);

export const gearRoutes = router;
