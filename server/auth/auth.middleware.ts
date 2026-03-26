import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../shared/http/error";
import { SafeUser } from "./auth.types";
import { AuthService } from "./auth.service";

export interface AuthenticatedRequest extends Request {
  authUser: SafeUser;
}

export function requireAuth(authService: AuthService, cookieName: string): RequestHandler {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const token = request.cookies?.[cookieName];

      if (!token || typeof token !== "string") {
        throw new AppError(401, "UNAUTHORIZED", "请先登录。");
      }

      const authUser = await authService.getUserFromToken(token);
      (request as AuthenticatedRequest).authUser = authUser;
      next();
    } catch (error) {
      next(error);
    }
  };
}
