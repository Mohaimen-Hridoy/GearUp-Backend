import { z } from "zod";

// Not restricted to Prisma's cuid() format: prisma/seed.ts intentionally
// gives demo gear items plain ids ("g1".."g6") to match the ids used in
// lib/mock-data.ts on the frontend, so a strict .cuid() check here would
// 400 on every seeded gear's detail/edit/delete/booked-dates route.
// Existence is still enforced by each controller's findUnique + 404 check.
export const cuidIdSchema = z.string().min(1, "ID is required");

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

// The frontend's gear form (lib/validation.ts gearSchema + components/gear/gear-form.tsx)
// takes a plain "Cover image URL" text input (z.string().url()) and a
// newline-separated textarea of gallery URLs, validated client-side against
// /^https?:\/\//i. No file picker or base64 conversion exists anywhere in
// the frontend, so the backend must accept http(s) image URLs, not data URLs.
const MAX_GALLERY_IMAGES = 5;

const imageSourceSchema = z.string().url("Image must be a valid URL");

export const getAllGearSchema = z.object({
  query: z
    .object({
      categoryId: emptyToUndefined(cuidIdSchema.optional()),
      brand: emptyToUndefined(z.string().min(1).optional()),
      search: emptyToUndefined(z.string().min(1).optional()),
      minPrice: emptyToUndefined(z.coerce.number().nonnegative().optional()),
      maxPrice: emptyToUndefined(z.coerce.number().nonnegative().optional()),
    })
    .superRefine((value, context) => {
      if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "minPrice cannot be greater than maxPrice",
          path: ["minPrice"],
        });
      }
    }),
});

export const gearIdParamsSchema = z.object({
  params: z.object({
    id: cuidIdSchema,
  }),
});

export const createGearSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    brand: z.string().min(1, "Brand is required"),
    categoryId: cuidIdSchema,
    pricePerDay: z.coerce.number().positive("Price per day must be positive"),
    stock: z.coerce.number().int().min(1, "Stock must be at least 1").default(1),
    isAvailable: z.boolean().default(true),
    imageUrl: emptyToUndefined(imageSourceSchema.optional()),
    images: z.array(imageSourceSchema).max(MAX_GALLERY_IMAGES, `Up to ${MAX_GALLERY_IMAGES} gallery images allowed`).optional(),
  }),
});

export const updateGearSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    brand: z.string().min(1).optional(),
    categoryId: cuidIdSchema.optional(),
    pricePerDay: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    imageUrl: emptyToUndefined(imageSourceSchema.optional()),
    images: z.array(imageSourceSchema).max(MAX_GALLERY_IMAGES, `Up to ${MAX_GALLERY_IMAGES} gallery images allowed`).optional(),
  }),
});
