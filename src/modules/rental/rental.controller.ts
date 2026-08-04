import { RentalOrderStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

const getRentalDays = (startDate: Date, endDate: Date) => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.ceil(diffMs / oneDayMs);
};

export const createRental = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const { gearItemId, startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new AppError(400, "endDate must be greater than startDate");
  }

  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found");
  }

  // `isAvailable` is the provider's manual on/off switch for the whole
  // listing. Whether a *specific* date range is bookable is a separate,
  // date-overlap question handled below — stock is no longer decremented
  // per-order, it represents how many units can be rented concurrently.
  if (!gearItem.isAvailable) {
    throw new AppError(400, "Gear item is currently not available");
  }

  const rentalDays = getRentalDays(start, end);
  const unitPrice = Number(gearItem.pricePerDay.toString());
  const totalPrice = rentalDays * unitPrice;

  const rentalOrder = await prisma.$transaction(async (tx) => {
    // Lock in the same transaction: count how many *other* active orders
    // for this gear overlap the requested [start, end) window. Two ranges
    // overlap when existing.startDate < newEnd AND existing.endDate > newStart.
    const overlappingCount = await tx.rentalOrder.count({
      where: {
        gearItemId,
        status: { not: RentalOrderStatus.CANCELLED },
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (overlappingCount >= gearItem.stock) {
      throw new AppError(409, "Gear item is already fully booked for the selected dates");
    }

    const order = await tx.rentalOrder.create({
      data: {
        customerId: req.user!.userId,
        gearItemId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: RentalOrderStatus.PLACED,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        gearItem: {
          include: {
            category: true,
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return order;
  });

  res.status(201).json({
    success: true,
    message: "Rental order created successfully",
    data: rentalOrder,
  });
});

export const getRentals = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(401, "Unauthorized request");
  }

  const whereCondition =
    req.user.role === Role.CUSTOMER
      ? { customerId: req.user.userId }
      : req.user.role === Role.PROVIDER
      ? { gearItem: { providerId: req.user.userId } }
      : {};

  const rentals = await prisma.rentalOrder.findMany({
    where: whereCondition,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gearItem: {
        include: {
          category: true,
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: "Rental orders retrieved successfully",
    data: rentals,
  });
});

export const getRentalById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(401, "Unauthorized request");
  }

  const rentalOrderId = String(req.params.id);

  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gearItem: {
        include: {
          category: true,
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental order not found");
  }

  const isCustomerOwner = rental.customerId === req.user.userId;
  const isProviderOwner = rental.gearItem.providerId === req.user.userId;
  const isAdmin = req.user.role === Role.ADMIN;

  if (!isCustomerOwner && !isProviderOwner && !isAdmin) {
    throw new AppError(403, "You are not allowed to access this rental order");
  }

  res.status(200).json({
    success: true,
    message: "Rental order retrieved successfully",
    data: rental,
  });
});

export const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const rentalOrderId = String(req.params.id);

  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: {
      gearItem: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental order not found");
  }

  if (rental.gearItem.providerId !== req.user.userId) {
    throw new AppError(403, "You can update only orders for your own gear");
  }

  const { status } = req.body;

  // Availability is now computed from date-overlapping active orders
  // (see createRental), so there is no per-unit stock counter to restore
  // here anymore — cancelling or returning an order simply frees up its
  // own date range for future overlap checks automatically.
  const updated = await prisma.rentalOrder.update({
    where: { id: rentalOrderId },
    data: { status },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gearItem: {
        include: {
          category: true,
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Rental order status updated successfully",
    data: updated,
  });
});
