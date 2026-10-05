import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = String(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: req.body.status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: updatedUser,
  });
});

export const getAdminGear = catchAsync(async (_req: Request, res: Response) => {
  const gear = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: "All gear retrieved successfully",
    data: gear,
  });
});

export const getAdminRentals = catchAsync(async (_req: Request, res: Response) => {
  const rentals = await prisma.rentalOrder.findMany({
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
    message: "All rental orders retrieved successfully",
    data: rentals,
  });
});

export const getAdminStats = catchAsync(async (_req: Request, res: Response) => {
  const [totalUsers, customerCount, providerCount, totalGear, availableGear, rentals] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.gearItem.count(),
    prisma.gearItem.count({ where: { isAvailable: true } }),
    prisma.rentalOrder.findMany({
      select: {
        status: true,
        totalPrice: true,
      },
    }),
  ]);

  const totalVolume = rentals.reduce((acc, order) => acc + Number(order.totalPrice.toString()), 0);
  const activeRentals = rentals.filter((r) => ["CONFIRMED", "PAID", "PICKED_UP"].includes(r.status)).length;
  const completedRentals = rentals.filter((r) => r.status === "RETURNED").length;

  res.status(200).json({
    success: true,
    message: "Admin statistics retrieved successfully",
    data: {
      users: {
        total: totalUsers,
        customers: customerCount,
        providers: providerCount,
      },
      gear: {
        total: totalGear,
        available: availableGear,
      },
      rentals: {
        total: rentals.length,
        active: activeRentals,
        completed: completedRentals,
        totalVolume,
      },
    },
  });
});
