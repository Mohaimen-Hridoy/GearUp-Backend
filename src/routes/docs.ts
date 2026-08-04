import { Router } from "express";
import { openApiSpec } from "../docs/openapi";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OpenAPI specification retrieved successfully",
    data: openApiSpec,
  });
});

export const docsRoutes = router;