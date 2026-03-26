import { Request, Response, NextFunction } from "express";
import { CookieOptions } from "express-serve-static-core";
import { AppConfig } from "../config/env";
import { AppError } from "../shared/http/error";
import { parseLoginCommand, parseRegisterCommand } from "./auth.schema";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "./auth.middleware";

function buildCookieOptions(config: AppConfig): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    path: "/",
    maxAge: config.authTokenTtlSeconds * 1000
  };
}

export function createAuthController(authService: AuthService, config: AppConfig) {
  const cookieOptions = buildCookieOptions(config);

  return {
    register: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const command = parseRegisterCommand(request.body);
        const result = await authService.register(command);

        response.cookie(config.authCookieName, result.token, cookieOptions);
        response.status(201).json({ user: result.user });
      } catch (error) {
        next(error);
      }
    },

    login: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const command = parseLoginCommand(request.body);
        const result = await authService.login(command);

        response.cookie(config.authCookieName, result.token, cookieOptions);
        response.status(200).json({ user: result.user });
      } catch (error) {
        next(error);
      }
    },

    me: async (request: Request, response: Response, next: NextFunction) => {
      try {
        const token = request.cookies?.[config.authCookieName];

        if (!token || typeof token !== "string") {
          response.status(200).json({ user: null });
          return;
        }

        const authUser = await authService.getUserFromToken(token);
        const authRequest = request as AuthenticatedRequest;
        authRequest.authUser = authUser;
        response.status(200).json({ user: authRequest.authUser });
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 401) {
          response.status(200).json({ user: null });
          return;
        }

        next(error);
      }
    },

    logout: (_request: Request, response: Response) => {
      response.clearCookie(config.authCookieName, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
        path: "/"
      });
      response.status(200).json({ ok: true });
    }
  };
}
