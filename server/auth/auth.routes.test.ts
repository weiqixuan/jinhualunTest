import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app";
import { AppConfig, loadConfig } from "../config/env";
import { AppError } from "../shared/http/error";
import { StoredUser } from "./auth.types";
import { UserRepository } from "./user.repository";

class InMemoryUserRepository implements UserRepository {
  private users: StoredUser[] = [];

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async create(user: StoredUser): Promise<void> {
    const exists = this.users.some((currentUser) => currentUser.email === user.email);

    if (exists) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "duplicate email");
    }

    this.users.push(user);
  }
}

async function createTestConfig(): Promise<AppConfig> {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "jinhualun-auth-"));

  return loadConfig({
    port: 4000,
    jwtSecret: "test-secret",
    authCookieName: "test_session",
    authTokenTtlSeconds: 3600,
    authStorageMode: "file",
    databaseUrl: null,
    usersDataFile: path.join(tempDirectory, "users.json"),
    isProduction: false
  });
}

function createTestApp(config: AppConfig) {
  return createApp(config, {
    userRepository: new InMemoryUserRepository()
  });
}

test("POST /api/auth/register creates a user and returns a session cookie", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  const response = await request(app).post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, "sales@example.com");
  assert.equal(response.body.user.displayName, "Alice Demo");
  assert.ok(Array.isArray(response.headers["set-cookie"]));
});

test("POST /api/auth/register rejects duplicate emails", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  await request(app).post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const duplicateResponse = await request(app).post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Bob Demo"
  });

  assert.equal(duplicateResponse.status, 409);
  assert.equal(duplicateResponse.body.error.code, "EMAIL_ALREADY_EXISTS");
});

test("POST /api/auth/login returns a session for valid credentials", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  await request(app).post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await request(app).post("/api/auth/login").send({
    email: "sales@example.com",
    password: "Password123"
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, "sales@example.com");
  assert.ok(Array.isArray(response.headers["set-cookie"]));
});

test("POST /api/auth/login rejects a wrong password", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  await request(app).post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await request(app).post("/api/auth/login").send({
    email: "sales@example.com",
    password: "WrongPassword"
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "INVALID_CREDENTIALS");
});

test("GET /api/auth/me returns null when there is no active session", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  const response = await request(app).get("/api/auth/me");

  assert.equal(response.status, 200);
  assert.equal(response.body.user, null);
});

test("GET /api/auth/me returns the current user after login", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);
  const agent = request.agent(app);

  await agent.post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await agent.get("/api/auth/me");

  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, "sales@example.com");
});

test("GET /api/unknown returns JSON 404 in the API-only server shape", async () => {
  const config = await createTestConfig();
  const app = createTestApp(config);

  const response = await request(app).get("/api/unknown");

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "NOT_FOUND");
});
