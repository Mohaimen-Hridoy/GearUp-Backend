import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorDetails: error.errorDetails ?? null,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errorDetails: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      message: "Database operation failed",
      errorDetails: {
        code: error.code,
        meta: error.meta ?? null,
      },
    });
    return;
  }

  const fallbackError = error as Error;
  res.status(500).json({
    success: false,
    message: fallbackError.message || "Internal server error",
    errorDetails: null,
  });
};
