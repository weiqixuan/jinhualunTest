import {
  AgentAppliedFilter,
  AgentPlannerSource,
  AgentQueryPlan,
  AgentTimeRange,
  MockAgentTrace
} from "./agent.types";
import { BusinessDataSnapshot } from "./businessData.types";

export interface QueryPlannerResult {
  plan: AgentQueryPlan;
  source: AgentPlannerSource;
  warnings: string[];
  trace: MockAgentTrace;
}

interface MockPlanMetadata {
  usedRecentFollowUpShortcut: boolean;
  usedDefaultProductClientPositionStatus: boolean;
}

function normalizeQuestion(value: string) {
  return value.replace(/[？?！!。,.，]/g, "").trim();
}

function findMatchedValue(question: string, candidates: string[]) {
  return candidates.find((candidate) => question.includes(candidate)) ?? null;
}

function detectProductType(question: string) {
  return findMatchedValue(question, ["股票型", "债券型", "混合型", "指数型"]);
}

function detectProductStatus(question: string) {
  return findMatchedValue(question, ["募集中", "运作中", "已清盘"]);
}

function detectPositionStatus(question: string) {
  if (question.includes("意向")) {
    return "意向中";
  }

  if (question.includes("已赎回")) {
    return "已赎回";
  }

  if (question.includes("持有") || question.includes("买了") || question.includes("购买")) {
    return "持有中";
  }

  return null;
}

function detectFollowUpChannel(question: string) {
  return findMatchedValue(question, ["电话", "微信", "面谈", "邮件"]);
}

function detectTimeRange(question: string): AgentTimeRange {
  if (question.includes("上个月")) {
    return "last_month";
  }

  if (question.includes("本月") || question.includes("这个月")) {
    return "this_month";
  }

  return "all_time";
}

function buildUnsupportedPlan(reason: string): AgentQueryPlan {
  return {
    supported: false,
    queryType: "unsupported",
    clientName: null,
    productName: null,
    productType: null,
    productStatus: null,
    positionStatus: null,
    followUpChannel: null,
    timeRange: null,
    reason
  };
}

function getIntentLabel(queryType: AgentQueryPlan["queryType"]) {
  switch (queryType) {
    case "client_holdings":
      return "客户持仓查询";
    case "product_clients":
      return "产品反查客户";
    case "follow_up_lookup":
      return "跟进记录查询";
    case "client_count":
      return "新增客户统计";
    default:
      return "未识别意图";
  }
}

function getTimeRangeLabel(timeRange: AgentTimeRange) {
  switch (timeRange) {
    case "this_month":
      return "本月";
    case "last_month":
      return "上个月";
    default:
      return "全部时间";
  }
}

function buildMatchedEntities(plan: AgentQueryPlan): AgentAppliedFilter[] {
  const entities: AgentAppliedFilter[] = [];

  if (plan.clientName) {
    entities.push({ label: "客户", value: plan.clientName });
  }

  if (plan.productName) {
    entities.push({ label: "产品", value: plan.productName });
  }

  if (plan.productType) {
    entities.push({ label: "产品类型", value: plan.productType });
  }

  if (plan.productStatus) {
    entities.push({ label: "产品状态", value: plan.productStatus });
  }

  if (plan.positionStatus) {
    entities.push({ label: "持仓状态", value: plan.positionStatus });
  }

  if (plan.followUpChannel) {
    entities.push({ label: "跟进渠道", value: plan.followUpChannel });
  }

  if (plan.timeRange && plan.timeRange !== "all_time") {
    entities.push({ label: "时间范围", value: getTimeRangeLabel(plan.timeRange) });
  }

  return entities;
}

function buildAppliedRules(
  normalizedQuestion: string,
  plan: AgentQueryPlan,
  metadata: MockPlanMetadata
) {
  const rules = ["已移除问句标点后执行关键词匹配。"];

  switch (plan.queryType) {
    case "client_holdings":
      rules.push("识别到客户名与“持有/买了/产品”语义，映射为客户持仓查询。");
      break;
    case "product_clients":
      rules.push("识别到产品名或产品类型与“哪些客户/谁持有”语义，映射为产品反查客户。");
      break;
    case "follow_up_lookup":
      rules.push("识别到客户名与“跟进/沟通/记录”语义，映射为跟进记录查询。");
      break;
    case "client_count":
      rules.push("识别到“新增 + 客户”语义，映射为新增客户统计。");
      break;
    default:
      rules.push("问题未命中当前 Mock Agent 支持的查询模式。");
      break;
  }

  if (plan.clientName) {
    rules.push(`命中客户“${plan.clientName}”。`);
  }

  if (plan.productName) {
    rules.push(`命中产品“${plan.productName}”。`);
  }

  if (plan.productType) {
    rules.push(`命中产品类型“${plan.productType}”。`);
  }

  if (plan.followUpChannel) {
    rules.push(`命中跟进渠道“${plan.followUpChannel}”。`);
  }

  if (metadata.usedRecentFollowUpShortcut) {
    rules.push("识别到“最近/近期”，在未指定月份时按“上个月”处理。");
  }

  if (metadata.usedDefaultProductClientPositionStatus) {
    rules.push("产品反查客户默认仅统计“持有中”的持仓记录。");
  }

  if (plan.timeRange && plan.timeRange !== "all_time") {
    rules.push(`命中时间范围“${getTimeRangeLabel(plan.timeRange)}”。`);
  }

  if (plan.queryType === "unsupported" && normalizedQuestion.length < 2) {
    rules.push("当前输入过短，无法稳定映射到业务查询。");
  }

  return rules;
}

function buildTrace(
  normalizedQuestion: string,
  plan: AgentQueryPlan,
  metadata: MockPlanMetadata
): MockAgentTrace {
  return {
    normalizedQuestion,
    matchedIntent: getIntentLabel(plan.queryType),
    matchedEntities: buildMatchedEntities(plan),
    appliedRules: buildAppliedRules(normalizedQuestion, plan, metadata)
  };
}

function buildMockPlan(question: string, snapshot: BusinessDataSnapshot): QueryPlannerResult {
  const normalizedQuestion = normalizeQuestion(question);
  const clientName = findMatchedValue(
    normalizedQuestion,
    snapshot.clients.map((client) => client.name)
  );
  const productName = findMatchedValue(
    normalizedQuestion,
    snapshot.products.map((product) => product.name)
  );
  const productType = detectProductType(normalizedQuestion);
  const productStatus = detectProductStatus(normalizedQuestion);
  const positionStatus = detectPositionStatus(normalizedQuestion);
  const followUpChannel = detectFollowUpChannel(normalizedQuestion);
  const timeRange = detectTimeRange(normalizedQuestion);
  const usedRecentFollowUpShortcut =
    (normalizedQuestion.includes("最近") || normalizedQuestion.includes("近期")) && timeRange === "all_time";
  const followUpTimeRange = usedRecentFollowUpShortcut ? "last_month" : timeRange;
  let plan: AgentQueryPlan;
  let metadata: MockPlanMetadata = {
    usedRecentFollowUpShortcut,
    usedDefaultProductClientPositionStatus: false
  };

  if (normalizedQuestion.includes("新增") && normalizedQuestion.includes("客户")) {
    plan = {
      supported: true,
      queryType: "client_count",
      clientName: null,
      productName: null,
      productType: null,
      productStatus: null,
      positionStatus: null,
      followUpChannel: null,
      timeRange,
      reason: null
    };
  } else if (
    clientName &&
    (normalizedQuestion.includes("持有") ||
      normalizedQuestion.includes("买了") ||
      normalizedQuestion.includes("产品"))
  ) {
    plan = {
      supported: true,
      queryType: "client_holdings",
      clientName,
      productName,
      productType,
      productStatus,
      positionStatus,
      followUpChannel: null,
      timeRange: "all_time",
      reason: null
    };
  } else if (
    (productName || productType) &&
    (normalizedQuestion.includes("哪些客户") ||
      normalizedQuestion.includes("谁买") ||
      normalizedQuestion.includes("谁持有") ||
      normalizedQuestion.includes("被哪些客户"))
  ) {
    metadata = {
      ...metadata,
      usedDefaultProductClientPositionStatus: positionStatus === null
    };
    plan = {
      supported: true,
      queryType: "product_clients",
      clientName: null,
      productName,
      productType,
      productStatus,
      positionStatus: positionStatus ?? "持有中",
      followUpChannel: null,
      timeRange: "all_time",
      reason: null
    };
  } else if (
    clientName &&
    (normalizedQuestion.includes("跟进") ||
      normalizedQuestion.includes("沟通") ||
      normalizedQuestion.includes("记录"))
  ) {
    plan = {
      supported: true,
      queryType: "follow_up_lookup",
      clientName,
      productName,
      productType,
      productStatus,
      positionStatus: null,
      followUpChannel,
      timeRange: followUpTimeRange,
      reason: null
    };
  } else {
    plan = buildUnsupportedPlan("当前仅支持客户持仓、产品反查客户、跟进记录和新增客户统计查询。");
  }

  return {
    plan,
    source: "mock",
    warnings: [],
    trace: buildTrace(normalizedQuestion, plan, metadata)
  };
}

export class AgentQueryPlanner {
  async plan(question: string, snapshot: BusinessDataSnapshot): Promise<QueryPlannerResult> {
    return buildMockPlan(question, snapshot);
  }
}
