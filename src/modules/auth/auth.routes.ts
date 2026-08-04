import { Router } from "express";
import { login, me, register } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, registerSchema } from "./auth.validation";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", auth(), me);

export const authRoutes = router;
