import { Prisma, PrismaClient, UserAccount } from "@prisma/client";
import { AppError } from "../shared/http/error";
import { StoredUser } from "./auth.types";
import { UserRepository } from "./user.repository";

function toStoredUser(record: UserAccount): StoredUser {
  return {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    createdAt: record.createdAt.toISOString(),
    passwordHash: record.passwordHash
  };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    try {
      const user = await this.prismaClient.userAccount.findUnique({
        where: { email }
      });

      return user ? toStoredUser(user) : null;
    } catch {
      throw new AppError(500, "USER_STORE_UNAVAILABLE", "用户存储暂时不可用，请稍后重试。");
    }
  }

  async findById(id: string): Promise<StoredUser | null> {
    try {
      const user = await this.prismaClient.userAccount.findUnique({
        where: { id }
      });

      return user ? toStoredUser(user) : null;
    } catch {
      throw new AppError(500, "USER_STORE_UNAVAILABLE", "用户存储暂时不可用，请稍后重试。");
    }
  }

  async create(user: StoredUser): Promise<void> {
    try {
      await this.prismaClient.userAccount.create({
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(user.createdAt),
          passwordHash: user.passwordHash
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, "EMAIL_ALREADY_EXISTS", "该邮箱已注册。", [
          { field: "email", message: "该邮箱已注册。" }
        ]);
      }

      throw new AppError(500, "USER_STORE_UNAVAILABLE", "用户存储暂时不可用，请稍后重试。");
    }
  }
}
