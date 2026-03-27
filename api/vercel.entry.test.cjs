const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const apiHandler = require("./[...route].js");
const apiRootHandler = require("./index.js");

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
