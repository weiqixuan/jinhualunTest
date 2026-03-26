import { Client, clientLevels } from "../../domain/client";
import { FollowUpRecord } from "../../domain/followUp";
import { Holding, positionStatuses } from "../../domain/holding";
import { Product, productStatuses, productTypes } from "../../domain/product";
import {
  ClientCoverageItem,
  DashboardHighlight,
  DashboardSummary,
  DashboardViewModel,
  ProductStatusDistributionItem,
  ProductTypeScaleItem
} from "./types";

interface AggregateDashboardInput {
  products: Product[];
  clients: Client[];
  holdings: Holding[];
  followUps: FollowUpRecord[];
}

const PRODUCT_TYPE_LABELS = new Map<string, string>([
  [productTypes[0], "股票型"],
  [productTypes[1], "债券型"],
  [productTypes[2], "混合型"],
  [productTypes[3], "指数型"]
]);

const PRODUCT_STATUS_LABELS = new Map<string, string>([
  [productStatuses[0], "募集中"],
  [productStatuses[1], "运作中"],
  [productStatuses[2], "已清盘"]
]);

const CLIENT_LEVEL_LABELS = new Map<string, string>([
  [clientLevels[0], "核心"],
  [clientLevels[1], "重点"],
  [clientLevels[2], "观察"]
]);

const STATUS_ORDER = new Map<string, number>(
  productStatuses.map((status, index) => [status, index] as const)
);

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function roundToOne(value: number) {
  return Number(value.toFixed(1));
}

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

function formatAmountInWan(value: number) {
  return `${new Intl.NumberFormat("zh-CN").format(Math.round(value))} 万元`;
}

function getProductTypeLabel(type: Product["type"]) {
  return PRODUCT_TYPE_LABELS.get(type) ?? type;
}

function getProductStatusLabel(status: Product["status"]) {
  return PRODUCT_STATUS_LABELS.get(status) ?? status;
}

function getClientLevelLabel(level: Client["level"]) {
  return CLIENT_LEVEL_LABELS.get(level) ?? level;
}

function buildLatestFollowUpDateByClientId(followUps: FollowUpRecord[]) {
  const latestFollowUpDateByClientId = new Map<string, string>();

  for (const record of followUps) {
    const currentLatestDate = latestFollowUpDateByClientId.get(record.clientId);

    if (!currentLatestDate || record.date > currentLatestDate) {
      latestFollowUpDateByClientId.set(record.clientId, record.date);
    }
  }

  return latestFollowUpDateByClientId;
}

function buildProductTypeScale(products: Product[]) {
  const groups = new Map<Product["type"], { aum: number; productCount: number }>();
  const totalAum = sumBy(products, (product) => product.aum);

  for (const product of products) {
    const currentGroup = groups.get(product.type) ?? { aum: 0, productCount: 0 };

    currentGroup.aum += product.aum;
    currentGroup.productCount += 1;
    groups.set(product.type, currentGroup);
  }

  return Array.from(groups.entries())
    .map<ProductTypeScaleItem>(([type, metrics]) => ({
      key: type,
      label: getProductTypeLabel(type),
      aum: roundToOne(metrics.aum),
      productCount: metrics.productCount,
      share: totalAum === 0 ? 0 : (metrics.aum / totalAum) * 100
    }))
    .sort((left, right) => right.aum - left.aum);
}

function buildClientCoverageRanking(
  clients: Client[],
  holdings: Holding[],
  latestFollowUpDateByClientId: Map<string, string>
) {
  const activePositionStatus = positionStatuses[0];
  const activeHoldings = holdings.filter((holding) => holding.positionStatus === activePositionStatus);
  const metricsByClientId = new Map<string, { holdingAmount: number; productIds: Set<string> }>();

  for (const holding of activeHoldings) {
    const currentMetrics = metricsByClientId.get(holding.clientId) ?? {
      holdingAmount: 0,
      productIds: new Set<string>()
    };

    currentMetrics.holdingAmount += holding.amount;
    currentMetrics.productIds.add(holding.productId);
    metricsByClientId.set(holding.clientId, currentMetrics);
  }

  return clients
    .map<ClientCoverageItem | null>((client) => {
      const metrics = metricsByClientId.get(client.id);

      if (!metrics) {
        return null;
      }

      return {
        clientId: client.id,
        clientName: client.name,
        owner: client.owner,
        levelLabel: getClientLevelLabel(client.level),
        holdingAmount: Math.round(metrics.holdingAmount),
        holdingProductCount: metrics.productIds.size,
        lastFollowUpDate: latestFollowUpDateByClientId.get(client.id) ?? null
      };
    })
    .filter((item): item is ClientCoverageItem => item !== null)
    .sort((left, right) => right.holdingAmount - left.holdingAmount)
    .slice(0, 5);
}

function buildProductStatusDistribution(products: Product[]) {
  const groups = new Map<Product["status"], { productCount: number; aum: number }>();

  for (const product of products) {
    const currentGroup = groups.get(product.status) ?? { productCount: 0, aum: 0 };

    currentGroup.productCount += 1;
    currentGroup.aum += product.aum;
    groups.set(product.status, currentGroup);
  }

  return Array.from(groups.entries())
    .map<ProductStatusDistributionItem>(([status, metrics]) => ({
      key: status,
      label: getProductStatusLabel(status),
      productCount: metrics.productCount,
      aum: roundToOne(metrics.aum)
    }))
    .sort((left, right) => {
      const leftOrder = STATUS_ORDER.get(left.key) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = STATUS_ORDER.get(right.key) ?? Number.MAX_SAFE_INTEGER;

      return leftOrder - rightOrder;
    });
}

function buildSummary(
  products: Product[],
  clients: Client[],
  holdings: Holding[],
  followUps: FollowUpRecord[]
): DashboardSummary {
  const onShelfStatuses = new Set(productStatuses.slice(0, 2));
  const activePositionStatus = positionStatuses[0];
  const coreClientLevel = clientLevels[0];
  const onShelfProducts = products.filter((product) => onShelfStatuses.has(product.status));
  const activeClientIds = new Set(
    holdings.filter((holding) => holding.positionStatus === activePositionStatus).map((holding) => holding.clientId)
  );
  const followedClientIds = new Set(followUps.map((record) => record.clientId));
  const engagedClientIds = new Set([...activeClientIds, ...followedClientIds]);
  const coreClients = clients.filter((client) => client.level === coreClientLevel);
  const coreCoveredCount = coreClients.filter((client) => engagedClientIds.has(client.id)).length;
  const coreClientCount = coreClients.length;

  return {
    onShelfProductCount: onShelfProducts.length,
    onShelfAum: roundToOne(sumBy(onShelfProducts, (product) => product.aum)),
    activeClientCount: activeClientIds.size,
    coreCoveredCount,
    coreClientCount,
    coreCoverageRate: coreClientCount === 0 ? 0 : (coreCoveredCount / coreClientCount) * 100,
    followedClientCount: followedClientIds.size,
    totalClientCount: clients.length
  };
}

function buildHighlights(summary: DashboardSummary, productTypeScale: ProductTypeScaleItem[], clientCoverageRanking: ClientCoverageItem[]) {
  const dominantType = productTypeScale[0];
  const topClient = clientCoverageRanking[0];

  const highlights: DashboardHighlight[] = [
    dominantType
      ? {
          title: "主推结构",
          description: `${dominantType.label}占在架规模 ${formatPercent(
            dominantType.share
          )}，适合作为当前路演与主推资源的优先配置方向。`
        }
      : {
          title: "主推结构",
          description: "当前没有可用于判断在架产品结构的数据。"
        },
    topClient
      ? {
          title: "覆盖重点",
          description: `${topClient.clientName} 当前持有 ${formatAmountInWan(
            topClient.holdingAmount
          )}，建议优先安排复盘或增配沟通。`
        }
      : {
          title: "覆盖重点",
          description: "当前没有活跃持仓客户，建议先补齐客户持仓关系。"
        },
    {
      title: "跟进温度",
      description:
        summary.totalClientCount === 0
          ? "当前没有客户数据。"
          : `已跟进 ${summary.followedClientCount}/${summary.totalClientCount} 位客户，核心覆盖率 ${formatPercent(
              summary.coreCoverageRate
            )}。`
    }
  ];

  return highlights;
}

export function aggregateDashboard({ products, clients, holdings, followUps }: AggregateDashboardInput): DashboardViewModel {
  const onShelfStatuses = new Set(productStatuses.slice(0, 2));
  const onShelfProducts = products.filter((product) => onShelfStatuses.has(product.status));
  const latestFollowUpDateByClientId = buildLatestFollowUpDateByClientId(followUps);
  const summary = buildSummary(products, clients, holdings, followUps);
  const productTypeScale = buildProductTypeScale(onShelfProducts);
  const clientCoverageRanking = buildClientCoverageRanking(clients, holdings, latestFollowUpDateByClientId);
  const productStatusDistribution = buildProductStatusDistribution(products);

  return {
    summary,
    highlights: buildHighlights(summary, productTypeScale, clientCoverageRanking),
    productTypeScale,
    clientCoverageRanking,
    productStatusDistribution
  };
}
