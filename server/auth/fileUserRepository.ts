import { promises as fs } from "node:fs";
import path from "node:path";
import { AppError } from "../shared/http/error";
import { StoredUser } from "./auth.types";
import { UserRepository } from "./user.repository";

export class FileUserRepository implements UserRepository {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const users = await this.readUsers();
    return users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    const users = await this.readUsers();
    return users.find((user) => user.id === id) ?? null;
  }

  async create(user: StoredUser): Promise<void> {
    await this.runExclusive(async () => {
      const users = await this.readUsers();
      const exists = users.some((currentUser) => currentUser.email === user.email);

      if (exists) {
        throw new AppError(409, "EMAIL_ALREADY_EXISTS", "该邮箱已注册。", [
          { field: "email", message: "该邮箱已注册。" }
        ]);
      }

      users.push(user);
      await this.writeUsers(users);
    });
  }

  private async runExclusive(task: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(task, task);
    await this.writeQueue;
  }

  private async ensureStore() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]\n", "utf8");
    }
  }

  private async readUsers(): Promise<StoredUser[]> {
    await this.ensureStore();

    try {
      const content = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content);

      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      throw new AppError(500, "USER_STORE_INVALID", "用户存储文件损坏，无法读取。");
    }
  }

  private async writeUsers(users: StoredUser[]) {
    await fs.writeFile(this.filePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  }
}
