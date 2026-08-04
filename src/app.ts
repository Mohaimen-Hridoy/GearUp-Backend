import cors from "cors";
import express from "express";
import morgan from "morgan";
import { apiRoutes } from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
// Gear listings can include a cover image URL plus up to 5 gallery image
// URLs; the default 100kb express.json() limit is already more than enough
// for plain URL strings, but a slightly higher ceiling keeps room for
// larger admin/rental payloads without needing to touch this again.
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GearUp backend starter is running",
    errorDetails: null,
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
