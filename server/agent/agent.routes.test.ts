import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import request from "supertest";
import { StoredUser } from "../auth/auth.types";
import { UserRepository } from "../auth/user.repository";
import { createApp } from "../app";
import { loadConfig } from "../config/env";
import { AppError } from "../shared/http/error";
import { AgentService } from "./agent.service";
import { StaticBusinessDataRepository } from "./businessDataRepository";
import { AgentQueryPlanner } from "./queryPlanner";
import { AgentQueryExecutor } from "./queryExecutor";

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

async function createTestConfig() {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "jinhualun-agent-"));

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

function createTestAgentService() {
  return new AgentService(
    new StaticBusinessDataRepository(),
    new AgentQueryPlanner(),
    new AgentQueryExecutor(() => new Date("2026-03-26T09:00:00.000Z"))
  );
}

test("POST /api/agent/query requires authentication", async () => {
  const config = await createTestConfig();
  const app = createApp(config, {
    userRepository: new InMemoryUserRepository(),
    agentService: createTestAgentService()
  });

  const response = await request(app).post("/api/agent/query").send({
    question: "张总持有哪些债券型产品？"
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});

test("POST /api/agent/query returns structured holdings for an authenticated user", async () => {
  const config = await createTestConfig();
  const app = createApp(config, {
    userRepository: new InMemoryUserRepository(),
    agentService: createTestAgentService()
  });
  const agent = request.agent(app);

  await agent.post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await agent.post("/api/agent/query").send({
    question: "张总持有哪些债券型产品？"
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.queryType, "client_holdings");
  assert.equal(response.body.plannerSource, "mock");
  assert.equal(response.body.records.length, 2);
  assert.equal(response.body.trace.matchedIntent, "客户持仓查询");
});

test("POST /api/agent/query returns a count for last month's new clients", async () => {
  const config = await createTestConfig();
  const app = createApp(config, {
    userRepository: new InMemoryUserRepository(),
    agentService: createTestAgentService()
  });
  const agent = request.agent(app);

  await agent.post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await agent.post("/api/agent/query").send({
    question: "上个月新增了几个客户？"
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.queryType, "client_count");
  assert.equal(response.body.summary[0].value, "3");
});

test("POST /api/agent/query applies explicit follow-up time range in mock mode", async () => {
  const config = await createTestConfig();
  const app = createApp(config, {
    userRepository: new InMemoryUserRepository(),
    agentService: createTestAgentService()
  });
  const agent = request.agent(app);

  await agent.post("/api/auth/register").send({
    email: "sales@example.com",
    password: "Password123",
    displayName: "Alice Demo"
  });

  const response = await agent.post("/api/agent/query").send({
    question: "张总上个月有哪些跟进记录？"
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.queryType, "follow_up_lookup");
  assert.equal(response.body.plannerSource, "mock");
  assert.equal(response.body.appliedFilters[1]?.value, "上个月");
  assert.equal(response.body.records.length, 0);
  assert.equal(response.body.trace.matchedEntities[1]?.value, "上个月");
});
