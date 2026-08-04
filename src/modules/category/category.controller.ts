import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new AppError(409, "Category already exists with this name or slug");
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});
