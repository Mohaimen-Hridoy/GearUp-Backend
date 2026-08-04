import { Role } from "@prisma/client";
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReview } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validateRequest(createReviewSchema), createReview);

export const reviewRoutes = router;
