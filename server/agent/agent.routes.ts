import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { AuthService } from "../auth/auth.service";
import { AppConfig } from "../config/env";
import { AgentService } from "./agent.service";
import { createAgentController } from "./agent.controller";

export function createAgentRouter(
  authService: AuthService,
  agentService: AgentService,
  config: AppConfig
) {
  const router = Router();
  const controller = createAgentController(agentService);

  router.post("/query", requireAuth(authService, config.authCookieName), controller.query);

  return router;
}
