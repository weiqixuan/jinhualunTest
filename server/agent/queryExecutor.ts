import { Client } from "../../src/domain/client";
import { Holding } from "../../src/domain/holding";
import { Product } from "../../src/domain/product";
import { BusinessDataSnapshot } from "./businessData.types";
import {
  AgentAppliedFilter,
  AgentExecutionResult,
  AgentQueryPlan,
  AgentResultRecord
} from "./agent.types";

function formatAmount(value: number) {
  return `${value.toLocaleString("zh-CN")} 万`;
}

function buildNoDataResult(plan: AgentQueryPlan, appliedFilters: AgentAppliedFilter[]): AgentExecutionResult {
  return {
    queryType: plan.queryType,
    supported: true,
    reason: null,
    appliedFilters,
    summary: [{ label: "命中记录", value: "0" }],
    records: []
  };
}

function buildUnsupportedExecution(reason: string | null): AgentExecutionResult {
  return {
    queryType: "unsupported",
    supported: false,
    reason,
    appliedFilters: [],
    summary: [],
    records: []
  };
}

function extractYearMonth(value: string) {
  const matched = /^(\d{4})-(\d{2})-(?:\d{2})/.exec(value);

  if (matched) {
    const year = Number(matched[1]);
    const month = Number(matched[2]);

    if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
      return { year, month: month - 1 };
    }
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return { year: parsed.getFullYear(), month: parsed.getMonth() };
}

function matchesTimeRange(value: string, timeRange: AgentQueryPlan["timeRange"], now: Date) {
  if (!timeRange || timeRange === "all_time") {
    return true;
  }

  const currentDate = new Date(now);
  const candidate = extractYearMonth(value);

  if (!candidate) {
    return false;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  if (timeRange === "this_month") {
    return candidate.year === currentYear && candidate.month === currentMonth;
  }

  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

  return candidate.year === previousMonthDate.getFullYear() && candidate.month === previousMonthDate.getMonth();
}

function findClientByName(clients: Client[], clientName: string | null) {
  if (!clientName) {
    return null;
  }

  return clients.find((client) => client.name === clientName) ?? null;
}

function findProductByName(products: Product[], productName: string | null) {
  if (!productName) {
    return null;
  }

  return products.find((product) => product.name === productName) ?? null;
}

function createRecordMaps(snapshot: BusinessDataSnapshot) {
  return {
    productById: new Map(snapshot.products.map((product) => [product.id, product])),
    clientById: new Map(snapshot.clients.map((client) => [client.id, client]))
  };
}

function filterHoldingWithPlan(holding: Holding, product: Product, plan: AgentQueryPlan) {
  if (plan.positionStatus && holding.positionStatus !== plan.positionStatus) {
    return false;
  }

  if (plan.productType && product.type !== plan.productType) {
    return false;
  }

  if (plan.productStatus && product.status !== plan.productStatus) {
    return false;
  }

  if (plan.productName && product.name !== plan.productName) {
    return false;
  }

  return true;
}

export class AgentQueryExecutor {
  constructor(private readonly nowProvider: () => Date = () => new Date()) {}

  execute(plan: AgentQueryPlan, snapshot: BusinessDataSnapshot): AgentExecutionResult {
    if (!plan.supported || plan.queryType === "unsupported") {
      return buildUnsupportedExecution(plan.reason);
    }

    switch (plan.queryType) {
      case "client_holdings":
        return this.executeClientHoldings(plan, snapshot);
      case "product_clients":
        return this.executeProductClients(plan, snapshot);
      case "follow_up_lookup":
        return this.executeFollowUpLookup(plan, snapshot);
      case "client_count":
        return this.executeClientCount(plan, snapshot);
      default:
        return buildUnsupportedExecution("当前查询类型暂不支持。");
    }
  }

  private executeClientHoldings(plan: AgentQueryPlan, snapshot: BusinessDataSnapshot): AgentExecutionResult {
    const targetClient = findClientByName(snapshot.clients, plan.clientName);
    const appliedFilters: AgentAppliedFilter[] = [];

    if (plan.clientName) {
      appliedFilters.push({ label: "客户", value: plan.clientName });
    }

    if (plan.productType) {
      appliedFilters.push({ label: "产品类型", value: plan.productType });
    }

    if (plan.positionStatus) {
      appliedFilters.push({ label: "持仓状态", value: plan.positionStatus });
    }

    if (!targetClient) {
      return buildNoDataResult(plan, appliedFilters);
    }

    const { productById } = createRecordMaps(snapshot);
    const records: AgentResultRecord[] = snapshot.holdings
      .filter((holding) => holding.clientId === targetClient.id)
      .flatMap((holding) => {
        const product = productById.get(holding.productId);

        if (!product || !filterHoldingWithPlan(holding, product, plan)) {
          return [];
        }

        return [
          {
            kind: "holding" as const,
            clientId: targetClient.id,
            clientName: targetClient.name,
            productId: product.id,
            productName: product.name,
            productType: product.type,
            productStatus: product.status,
            positionStatus: holding.positionStatus,
            amount: holding.amount
          }
        ];
      });

    if (records.length === 0) {
      return buildNoDataResult(plan, appliedFilters);
    }

    const totalAmount = records.reduce((sum, record) => {
      if (record.kind !== "holding") {
        return sum;
      }

      return sum + record.amount;
    }, 0);

    return {
      queryType: plan.queryType,
      supported: true,
      reason: null,
      appliedFilters,
      summary: [
        { label: "命中产品", value: String(records.length) },
        { label: "合计持仓", value: formatAmount(totalAmount) }
      ],
      records
    };
  }

  private executeProductClients(plan: AgentQueryPlan, snapshot: BusinessDataSnapshot): AgentExecutionResult {
    const targetProduct = findProductByName(snapshot.products, plan.productName);
    const appliedFilters: AgentAppliedFilter[] = [];

    if (plan.productName) {
      appliedFilters.push({ label: "产品", value: plan.productName });
    }

    if (plan.productType) {
      appliedFilters.push({ label: "产品类型", value: plan.productType });
    }

    if (plan.positionStatus) {
      appliedFilters.push({ label: "持仓状态", value: plan.positionStatus });
    }

    const { clientById, productById } = createRecordMaps(snapshot);
    const matchedProductIds = new Set(
      snapshot.products
        .filter((product) => {
          if (targetProduct && product.id !== targetProduct.id) {
            return false;
          }

          if (plan.productType && product.type !== plan.productType) {
            return false;
          }

          if (plan.productStatus && product.status !== plan.productStatus) {
            return false;
          }

          return true;
        })
        .map((product) => product.id)
    );

    if (matchedProductIds.size === 0) {
      return buildNoDataResult(plan, appliedFilters);
    }

    const records: AgentResultRecord[] = snapshot.holdings.flatMap((holding) => {
      if (!matchedProductIds.has(holding.productId)) {
        return [];
      }

      if (plan.positionStatus && holding.positionStatus !== plan.positionStatus) {
        return [];
      }

      const client = clientById.get(holding.clientId);
      const product = productById.get(holding.productId);

      if (!client || !product) {
        return [];
      }

      return [
        {
          kind: "client" as const,
          clientId: client.id,
          clientName: client.name,
          company: client.company,
          owner: client.owner,
          productId: product.id,
          productName: product.name,
          amount: holding.amount,
          positionStatus: holding.positionStatus
        }
      ];
    });

    if (records.length === 0) {
      return buildNoDataResult(plan, appliedFilters);
    }

    const totalAmount = records.reduce((sum, record) => {
      if (record.kind !== "client" || record.amount === null) {
        return sum;
      }

      return sum + record.amount;
    }, 0);

    return {
      queryType: plan.queryType,
      supported: true,
      reason: null,
      appliedFilters,
      summary: [
        { label: "命中客户", value: String(records.length) },
        { label: "合计持仓", value: formatAmount(totalAmount) }
      ],
      records
    };
  }

  private executeFollowUpLookup(plan: AgentQueryPlan, snapshot: BusinessDataSnapshot): AgentExecutionResult {
    const targetClient = findClientByName(snapshot.clients, plan.clientName);
    const appliedFilters: AgentAppliedFilter[] = [];

    if (plan.clientName) {
      appliedFilters.push({ label: "客户", value: plan.clientName });
    }

    if (plan.followUpChannel) {
      appliedFilters.push({ label: "跟进渠道", value: plan.followUpChannel });
    }

    if (plan.timeRange && plan.timeRange !== "all_time") {
      appliedFilters.push({
        label: "时间范围",
        value: plan.timeRange === "last_month" ? "上个月" : "本月"
      });
    }

    if (!targetClient) {
      return buildNoDataResult(plan, appliedFilters);
    }

    const { productById } = createRecordMaps(snapshot);
    const now = this.nowProvider();
    const records: AgentResultRecord[] = snapshot.followUps
      .filter((record) => record.clientId === targetClient.id)
      .filter((record) => !plan.followUpChannel || record.channel === plan.followUpChannel)
      .filter((record) => matchesTimeRange(record.date, plan.timeRange, now))
      .sort((left, right) => right.date.localeCompare(left.date))
      .map((record) => ({
        kind: "follow_up" as const,
        id: record.id,
        clientId: targetClient.id,
        clientName: targetClient.name,
        date: record.date,
        channel: record.channel,
        content: record.content,
        relatedProductNames: record.relatedProductIds
          .map((productId) => productById.get(productId)?.name)
          .filter((name): name is string => Boolean(name))
      }));

    if (records.length === 0) {
      return buildNoDataResult(plan, appliedFilters);
    }

    return {
      queryType: plan.queryType,
      supported: true,
      reason: null,
      appliedFilters,
      summary: [{ label: "命中跟进", value: String(records.length) }],
      records
    };
  }

  private executeClientCount(plan: AgentQueryPlan, snapshot: BusinessDataSnapshot): AgentExecutionResult {
    const now = this.nowProvider();
    const records = snapshot.clients.filter((client) =>
      matchesTimeRange(client.createdAt, plan.timeRange, now)
    );
    const appliedFilters: AgentAppliedFilter[] = [];

    if (plan.timeRange && plan.timeRange !== "all_time") {
      appliedFilters.push({
        label: "时间范围",
        value: plan.timeRange === "last_month" ? "上个月" : "本月"
      });
    }

    return {
      queryType: plan.queryType,
      supported: true,
      reason: null,
      appliedFilters,
      summary: [{ label: "新增客户数", value: String(records.length) }],
      records: records.map((client) => ({
        kind: "client" as const,
        clientId: client.id,
        clientName: client.name,
        company: client.company,
        owner: client.owner,
        productId: null,
        productName: null,
        amount: null,
        positionStatus: null
      }))
    };
  }
}
