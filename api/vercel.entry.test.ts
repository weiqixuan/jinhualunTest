import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import apiHandler from "./[...route]";
import apiRootHandler from "./index";

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
