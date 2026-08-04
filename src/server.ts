import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const port = Number(env.PORT);

const startServer = async () => {
  await prisma.$connect();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
