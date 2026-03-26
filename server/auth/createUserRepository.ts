import { AppConfig } from "../config/env";
import { prisma } from "../db/prisma";
import { FileUserRepository } from "./fileUserRepository";
import { PrismaUserRepository } from "./prismaUserRepository";

export function createUserRepository(config: AppConfig) {
  if (config.authStorageMode === "prisma") {
    return new PrismaUserRepository(prisma);
  }

  return new FileUserRepository(config.usersDataFile);
}
