import { Router } from "express";
import { AppConfig } from "../config/env";
import { AuthService } from "./auth.service";
import { createAuthController } from "./auth.controller";

export function createAuthRouter(authService: AuthService, config: AppConfig) {
  const router = Router();
  const controller = createAuthController(authService, config);

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/me", controller.me);
  router.post("/logout", controller.logout);

  return router;
}
