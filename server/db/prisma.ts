import { PrismaClient } from "@prisma/client";

interface GlobalWithPrisma {
  __jinhualunPrisma?: PrismaClient;
}

const globalForPrisma = globalThis as typeof globalThis & GlobalWithPrisma;

export function createPrismaClient() {
  return new PrismaClient();
}

export const prisma = globalForPrisma.__jinhualunPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__jinhualunPrisma = prisma;
}
