import { PaymentStatus, RentalOrderStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";
import { stripeClient } from "../../config/stripe";

export const createPayment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(401, "Unauthorized request");
  }

  const { rentalOrderId } = req.body;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found");
  }

  if (order.customerId !== req.user.userId) {
    throw new AppError(403, "You can create payment only for your own rental order");
  }

  if (order.status !== RentalOrderStatus.PLACED && order.status !== RentalOrderStatus.CONFIRMED) {
    throw new AppError(400, "Payment can be created only for placed or confirmed orders");
  }

  if (!stripeClient) {
    throw new AppError(
      500,
      "Payment gateway is not configured. Set STRIPE_SECRET_KEY to process real payments."
    );
  }

  const transactionId = order.payment?.transactionId ?? `txn_${Date.now()}`;
  const amount = Number(order.totalPrice.toString());

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: {
      rentalOrderId: order.id,
      customerId: order.customerId,
    },
  });
  const paymentIntentId: string = paymentIntent.id;
  const clientSecret: string | null = paymentIntent.client_secret;

  const payment = await prisma.payment.upsert({
    where: { rentalOrderId: order.id },
    update: {
      amount,
      provider: "stripe",
      status: PaymentStatus.PENDING,
      paymentIntentId,
    },
    create: {
      rentalOrderId: order.id,
      transactionId,
      amount,
      provider: "stripe",
      status: PaymentStatus.PENDING,
      paymentIntentId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    data: {
      payment,
      clientSecret,
    },
  });
});

export const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { transactionId, rentalOrderId, paymentIntentId } = req.body;

  let payment = null;

  if (transactionId) {
    payment = await prisma.payment.findUnique({
      where: { transactionId },
    });
  }

  if (!payment && rentalOrderId) {
    payment = await prisma.payment.findUnique({
      where: { rentalOrderId },
    });
  }

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  if (!paymentIntentId) {
    throw new AppError(400, "paymentIntentId is required for Stripe confirmation");
  }

  if (!stripeClient) {
    throw new AppError(500, "Stripe gateway is not configured");
  }

  const intent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    throw new AppError(400, "Stripe payment intent is not successful yet");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: payment.rentalOrderId },
    data: { status: RentalOrderStatus.PAID },
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
    message: "Payment confirmed successfully",
    data: updatedOrder,
  });
});

export const getPayments = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(401, "Unauthorized request");
  }

  const whereCondition =
    req.user.role === Role.CUSTOMER
      ? { rentalOrder: { customerId: req.user.userId } }
      : req.user.role === Role.PROVIDER
      ? { rentalOrder: { gearItem: { providerId: req.user.userId } } }
      : {};

  const payments = await prisma.payment.findMany({
    where: whereCondition,
    include: {
      rentalOrder: {
        include: {
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
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: "Payments retrieved successfully",
    data: payments,
  });
});

export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(401, "Unauthorized request");
  }

  const paymentId = String(req.params.id);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
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
          customer: {
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

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const isCustomerOwner = payment.rentalOrder.customerId === req.user.userId;
  const isProviderOwner = payment.rentalOrder.gearItem.providerId === req.user.userId;
  const isAdmin = req.user.role === Role.ADMIN;

  if (!isCustomerOwner && !isProviderOwner && !isAdmin) {
    throw new AppError(403, "You are not allowed to access this payment");
  }

  res.status(200).json({
    success: true,
    message: "Payment retrieved successfully",
    data: payment,
  });
});
