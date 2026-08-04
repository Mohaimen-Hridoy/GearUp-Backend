import { Role } from "@prisma/client";
import { Router } from "express";
import { createCategory, getCategories } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCategorySchema } from "./category.validation";

const router = Router();

router.get("/", getCategories);
router.post("/", auth(Role.ADMIN), validateRequest(createCategorySchema), createCategory);

export const categoryRoutes = router;
