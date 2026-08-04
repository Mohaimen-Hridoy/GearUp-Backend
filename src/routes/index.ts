import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { gearRoutes } from "../modules/gear/gear.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { rentalRoutes } from "../modules/rental/rental.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { docsRoutes } from "./docs";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/gear", gearRoutes);
router.use("/rentals", rentalRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/provider/gear", gearRoutes);
router.use("/provider/orders", rentalRoutes);
router.use("/docs", docsRoutes);

export const apiRoutes = router;
