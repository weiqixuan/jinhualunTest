import cookieParser from "cookie-parser";
import express from "express";
import { AppConfig, loadConfig } from "./config/env";
import { createAuthRouter } from "./auth/auth.routes";
import { AuthService } from "./auth/auth.service";
import { TokenService } from "./auth/tokenService";
import { createUserRepository } from "./auth/createUserRepository";
import { UserRepository } from "./auth/user.repository";
import { AgentService, createAgentService } from "./agent/agent.service";
import { createAgentRouter } from "./agent/agent.routes";
import { errorHandler } from "./shared/http/errorHandler";
import { notFoundHandler } from "./shared/http/notFoundHandler";

interface CreateAppDependencies {
  userRepository?: UserRepository;
  agentService?: AgentService;
}

export function createApp(
  config: AppConfig = loadConfig(),
  dependencies: CreateAppDependencies = {}
) {
  const app = express();
  const userRepository = dependencies.userRepository ?? createUserRepository(config);
  const tokenService = new TokenService(config.jwtSecret, config.authTokenTtlSeconds);
  const authService = new AuthService(userRepository, tokenService);
  const agentService = dependencies.agentService ?? createAgentService(config);

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ ok: true, authStorageMode: config.authStorageMode });
  });

  app.use("/api/auth", createAuthRouter(authService, config));
  app.use("/api/agent", createAgentRouter(authService, agentService, config));
  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
