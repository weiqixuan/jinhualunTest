import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../shared/http/error";
import { AuthTokenPayload } from "./auth.types";

export class TokenService {
  constructor(
    private readonly jwtSecret: string,
    private readonly authTokenTtlSeconds: number
  ) {}

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      algorithm: "HS256",
      expiresIn: this.authTokenTtlSeconds
    });
  }

  verify(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      const subject = decoded.sub;

      if (!subject || typeof subject !== "string") {
        throw new AppError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录。");
      }

      return {
        sub: subject
      };
    } catch {
      throw new AppError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录。");
    }
  }
}
