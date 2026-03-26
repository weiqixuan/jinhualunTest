import assert from "node:assert/strict";
import test from "node:test";
import { StaticBusinessDataRepository } from "./businessDataRepository";
import { AgentQueryPlan } from "./agent.types";
import { AgentQueryExecutor } from "./queryExecutor";

test("AgentQueryExecutor returns Zhang's bond holdings", async () => {
  const repository = new StaticBusinessDataRepository();
  const executor = new AgentQueryExecutor(() => new Date("2026-03-26T09:00:00.000Z"));
  const snapshot = await repository.getSnapshot();
  const plan: AgentQueryPlan = {
    supported: true,
    queryType: "client_holdings",
    clientName: "张总",
    productName: null,
    productType: "债券型",
    productStatus: null,
    positionStatus: "持有中",
    followUpChannel: null,
    timeRange: "all_time",
    reason: null
  };

  const result = executor.execute(plan, snapshot);

  assert.equal(result.queryType, "client_holdings");
  assert.equal(result.records.length, 2);
  assert.equal(result.summary[0]?.value, "2");
});

test("AgentQueryExecutor counts clients created last month", async () => {
  const repository = new StaticBusinessDataRepository();
  const executor = new AgentQueryExecutor(() => new Date("2026-03-26T09:00:00.000Z"));
  const snapshot = await repository.getSnapshot();
  const plan: AgentQueryPlan = {
    supported: true,
    queryType: "client_count",
    clientName: null,
    productName: null,
    productType: null,
    productStatus: null,
    positionStatus: null,
    followUpChannel: null,
    timeRange: "last_month",
    reason: null
  };

  const result = executor.execute(plan, snapshot);

  assert.equal(result.queryType, "client_count");
  assert.equal(result.summary[0]?.value, "3");
  assert.equal(result.records.length, 3);
});
