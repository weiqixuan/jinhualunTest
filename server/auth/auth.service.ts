import { randomUUID } from "node:crypto";
import { AppError } from "../shared/http/error";
import { LoginCommand, SafeUser, StoredUser, RegisterCommand } from "./auth.types";
import { hashPassword, verifyPassword } from "./passwordHasher";
import { TokenService } from "./tokenService";
import { UserRepository } from "./user.repository";

function toSafeUser(user: StoredUser): SafeUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt
  };
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async register(command: RegisterCommand): Promise<{ user: SafeUser; token: string }> {
    const existingUser = await this.userRepository.findByEmail(command.email);

    if (existingUser) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "该邮箱已注册。", [
        { field: "email", message: "该邮箱已注册。" }
      ]);
    }

    const user: StoredUser = {
      id: randomUUID(),
      email: command.email,
      displayName: command.displayName,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(command.password)
    };

    await this.userRepository.create(user);

    return {
      user: toSafeUser(user),
      token: this.tokenService.sign({ sub: user.id })
    };
  }

  async login(command: LoginCommand): Promise<{ user: SafeUser; token: string }> {
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "邮箱或密码错误。");
    }

    const isValid = await verifyPassword(command.password, user.passwordHash);

    if (!isValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "邮箱或密码错误。");
    }

    return {
      user: toSafeUser(user),
      token: this.tokenService.sign({ sub: user.id })
    };
  }

  async getUserFromToken(token: string): Promise<SafeUser> {
    const payload = this.tokenService.verify(token);
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录。");
    }

    return toSafeUser(user);
  }
}
