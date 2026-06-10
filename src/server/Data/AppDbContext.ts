import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  const options = process.env.DATABASE_URL 
    ? {
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }
    : undefined;

  prisma = new PrismaClient(options);
} catch (error) {
  console.error("Critical: Failed to initialize Prisma Client at startup:", error);
  prisma = new PrismaClient();
}

export default prisma;


