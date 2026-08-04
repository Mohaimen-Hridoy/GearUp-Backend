import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gearup.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
const adminName = process.env.ADMIN_NAME ?? "GearUp Admin";

const starterCategories = [
  { name: "Camping", slug: "camping" },
  { name: "Climbing", slug: "climbing" },
  { name: "Cycling", slug: "cycling" },
  { name: "Fitness", slug: "fitness" },
  { name: "Water sports", slug: "water-sports" },
  { name: "Winter", slug: "winter" },
];

async function main() {
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const customerPassword = await bcrypt.hash("Customer@12345", 10);
  const providerPassword = await bcrypt.hash("Provider@12345", 10);

  // Seed Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
  });

  // Seed Customer
  await prisma.user.upsert({
    where: { email: "customer@gearup.com" },
    update: {
      name: "GearUp Customer",
      password: customerPassword,
      role: Role.CUSTOMER,
      status: "ACTIVE",
    },
    create: {
      name: "GearUp Customer",
      email: "customer@gearup.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      status: "ACTIVE",
    },
  });

  // Seed Provider
  const provider = await prisma.user.upsert({
    where: { email: "provider@gearup.com" },
    update: {
      name: "GearUp Provider",
      password: providerPassword,
      role: Role.PROVIDER,
      status: "ACTIVE",
    },
    create: {
      name: "GearUp Provider",
      email: "provider@gearup.com",
      password: providerPassword,
      role: Role.PROVIDER,
      status: "ACTIVE",
    },
  });

  // Seed Categories
  const categoryMap: Record<string, string> = {};
  for (const category of starterCategories) {
    const dbCat = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryMap[category.slug] = dbCat.id;
  }

  // Seed Gear Items matching mock-data.ts
  const gearItems = [
    {
      id: "g1",
      title: "4-Person Blackout Tent",
      description:
        "A weatherproof, four-season tent with a blackout inner for sleeping past sunrise. Sets up in under six minutes and packs down to the size of a loaf of bread.",
      brand: "Northfell",
      pricePerDay: 32.00,
      stock: 3,
      imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
      images: [],
      isAvailable: true,
      categoryId: categoryMap["camping"],
    },
    {
      id: "g2",
      title: "Alpine Trad Rack (Full Set)",
      description:
        "A full trad rack — cams, nuts, slings, and two 60m dry-treated ropes. Recently retired from guided use, still well within safe working life.",
      brand: "Craghold",
      pricePerDay: 45.00,
      stock: 1,
      imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
      images: [],
      isAvailable: true,
      categoryId: categoryMap["climbing"],
    },
    {
      id: "g3",
      title: "Touring Kayak, 14ft",
      description:
        "A stable, tracks-straight sea kayak built for day-touring on lakes and calm coastline. Comes with paddle, spray skirt, and roof straps.",
      brand: "Driftline",
      pricePerDay: 55.00,
      stock: 2,
      imageUrl: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800&q=80",
      images: [],
      isAvailable: true,
      categoryId: categoryMap["water-sports"],
    },
    {
      id: "g4",
      title: "Backcountry Split Board Set",
      description:
        "Split board, skins, and poles for backcountry touring. Mounted with adjustable bindings to fit most boot sizes.",
      brand: "Ridgehaus",
      pricePerDay: 60.00,
      stock: 2,
      imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",
      images: [],
      isAvailable: true,
      categoryId: categoryMap["winter"],
    },
    {
      id: "g5",
      title: "Camp Kitchen Box",
      description:
        "A stocked chuck box: two-burner stove, cookware for four, cutting board, and a full utensil roll. Everything smells like campfire, in a good way.",
      brand: "Northfell",
      pricePerDay: 18.00,
      stock: 4,
      imageUrl: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80",
      images: [],
      isAvailable: true,
      categoryId: categoryMap["camping"],
    },
    {
      id: "g6",
      title: "Bouldering Crash Pad",
      description:
        "Dual-density foam crash pad, tri-fold for easy carry. Reinforced corners and a wipeable shell.",
      brand: "Craghold",
      pricePerDay: 22.00,
      stock: 3,
      imageUrl: "https://images.unsplash.com/photo-1516592066896-8c2c1b7c8d5c?w=800&q=80",
      images: [],
      isAvailable: false,
      categoryId: categoryMap["climbing"],
    },
  ];

  for (const gear of gearItems) {
    await prisma.gearItem.upsert({
      where: { id: gear.id },
      update: {
        title: gear.title,
        description: gear.description,
        brand: gear.brand,
        pricePerDay: gear.pricePerDay,
        stock: gear.stock,
        imageUrl: gear.imageUrl,
        images: gear.images,
        isAvailable: gear.isAvailable,
        categoryId: gear.categoryId,
        providerId: provider.id,
      },
      create: {
        id: gear.id,
        title: gear.title,
        description: gear.description,
        brand: gear.brand,
        pricePerDay: gear.pricePerDay,
        stock: gear.stock,
        imageUrl: gear.imageUrl,
        images: gear.images,
        isAvailable: gear.isAvailable,
        categoryId: gear.categoryId,
        providerId: provider.id,
      },
    });
  }

  console.log(`Seeded admin: ${adminEmail}`);
  console.log(`Seeded customer: customer@gearup.com`);
  console.log(`Seeded provider: provider@gearup.com`);
  console.log("Seeded default gear items!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
