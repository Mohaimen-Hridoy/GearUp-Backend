import { Request, Response } from "express";
import { RentalOrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const { gearItemId, rating, comment } = req.body;

  const order = await prisma.rentalOrder.findFirst({
    where: {
      customerId: req.user.userId,
      gearItemId,
      status: RentalOrderStatus.RETURNED,
    },
  });

  if (!order) {
    throw new AppError(400, "You can review only returned rental items");
  }

  const review = await prisma.review.create({
    data: {
      customerId: req.user.userId,
      gearItemId,
      rating,
      comment,
    },
  });

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: review,
  });
});
