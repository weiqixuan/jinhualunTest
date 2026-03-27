const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const apiHandler = require("./[...route].js");
const apiRootHandler = require("./index.js");
const authHandler = require("./auth/[...route].js");
const agentHandler = require("./agent/[...route].js");

test("Vercel catch-all handler exposes the API health route", async () => {
  const response = await request(apiHandler).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});

test("Vercel API root keeps the JSON not-found contract", async () => {
  const response = await request(apiRootHandler).get("/api");

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "NOT_FOUND");
});

test("Nested auth Vercel handler exposes the guest-safe me probe", async () => {
  const response = await request(authHandler).get("/api/auth/me");

  assert.equal(response.status, 200);
  assert.equal(response.body.user, null);
});

test("Nested agent Vercel handler keeps auth protection", async () => {
  const response = await request(agentHandler).post("/api/agent/query").send({
    question: "张总持有哪些债券型产品？"
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});
