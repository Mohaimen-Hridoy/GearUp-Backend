import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

export const createGear = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const payload = req.body;

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const gear = await prisma.gearItem.create({
    data: {
      title: payload.title,
      description: payload.description,
      brand: payload.brand,
      categoryId: payload.categoryId,
      pricePerDay: payload.pricePerDay,
      stock: payload.stock,
      isAvailable: payload.isAvailable,
      imageUrl: payload.imageUrl,
      images: payload.images ?? [],
      providerId: req.user.userId,
    },
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
  });

  res.status(201).json({
    success: true,
    message: "Gear created successfully",
    data: gear,
  });
});

export const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.query.categoryId as string | undefined;
  const brand = req.query.brand as string | undefined;
  const search = req.query.search as string | undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

  const isProviderRoute = req.baseUrl.includes("/provider/gear");
  const providerId = isProviderRoute && req.user?.userId ? req.user.userId : undefined;

  const gearItems = await prisma.gearItem.findMany({
    where: {
      ...(providerId ? { providerId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(brand ? { brand: { contains: brand, mode: "insensitive" } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            pricePerDay: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    },
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
    message: "Gear list retrieved successfully",
    data: gearItems,
  });
});

export const getGearById = catchAsync(async (req: Request, res: Response) => {
  const gearId = String(req.params.id);

  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
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
  });

  if (!gear) {
    throw new AppError(404, "Gear not found");
  }

  res.status(200).json({
    success: true,
    message: "Gear details retrieved successfully",
    data: gear,
  });
});

export const getGearBookedDates = catchAsync(async (req: Request, res: Response) => {
  const gearId = String(req.params.id);

  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearId },
    select: { id: true, stock: true },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear not found");
  }

  // Any order that hasn't been cancelled still holds a unit for its date
  // range — RETURNED orders are kept too since a returned-early order's
  // original window is no longer relevant, but we still want a simple,
  // predictable rule: only CANCELLED orders free up a date range.
  const activeOrders = await prisma.rentalOrder.findMany({
    where: {
      gearItemId: gearId,
      status: { not: "CANCELLED" },
    },
    select: { id: true, startDate: true, endDate: true },
  });

  res.status(200).json({
    success: true,
    message: "Booked date ranges retrieved successfully",
    data: {
      stock: gearItem.stock,
      bookedRanges: activeOrders.map((order) => ({
        startDate: order.startDate,
        endDate: order.endDate,
      })),
    },
  });
});

export const updateGear = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const gearId = String(req.params.id);

  const existingGear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!existingGear) {
    throw new AppError(404, "Gear not found");
  }

  if (existingGear.providerId !== req.user.userId) {
    throw new AppError(403, "You can update only your own gear");
  }

  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: req.body,
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
  });

  res.status(200).json({
    success: true,
    message: "Gear updated successfully",
    data: updatedGear,
  });
});

export const deleteGear = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const gearId = String(req.params.id);

  const existingGear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!existingGear) {
    throw new AppError(404, "Gear not found");
  }

  if (existingGear.providerId !== req.user.userId) {
    throw new AppError(403, "You can delete only your own gear");
  }

  await prisma.gearItem.delete({
    where: { id: gearId },
  });

  res.status(200).json({
    success: true,
    message: "Gear deleted successfully",
    data: null,
  });
});
