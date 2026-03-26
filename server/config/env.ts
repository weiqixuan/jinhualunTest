import path from "node:path";

export type AuthStorageMode = "file" | "prisma";

export interface AppConfig {
  port: number;
  jwtSecret: string;
  authCookieName: string;
  authTokenTtlSeconds: number;
  authStorageMode: AuthStorageMode;
  databaseUrl: string | null;
  usersDataFile: string;
  isProduction: boolean;
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseAuthStorageMode(value: string | undefined, hasDatabaseUrl: boolean): AuthStorageMode {
  if (value === "file" || value === "prisma") {
    return value;
  }

  return hasDatabaseUrl ? "prisma" : "file";
}

export function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const cwd = process.cwd();
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL?.trim() || null;
  const config: AppConfig = {
    port: parseNumber(process.env.PORT, 4000),
    jwtSecret: process.env.JWT_SECRET ?? "dev-change-me",
    authCookieName: process.env.AUTH_COOKIE_NAME ?? "jinhualun_session",
    authTokenTtlSeconds: parseNumber(process.env.AUTH_TOKEN_TTL_SECONDS, 60 * 60 * 24 * 7),
    authStorageMode: parseAuthStorageMode(process.env.AUTH_STORAGE, Boolean(databaseUrl)),
    databaseUrl,
    usersDataFile: path.resolve(cwd, process.env.USERS_DATA_FILE ?? "server/data/users.json"),
    isProduction,
    ...overrides
  };

  if (config.isProduction && config.jwtSecret === "dev-change-me") {
    throw new Error("JWT_SECRET must be configured in production.");
  }

  if (config.authStorageMode === "prisma" && !config.databaseUrl) {
    throw new Error("DATABASE_URL must be configured when AUTH_STORAGE=prisma.");
  }

  if (config.isProduction && config.authStorageMode !== "prisma") {
    throw new Error("AUTH_STORAGE=file is not allowed in production.");
  }

  return config;
}
