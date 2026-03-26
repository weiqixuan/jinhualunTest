import { useEffect, useMemo, useState } from "react";
import { Alert, App as AntApp, Button, Card, Col, Empty, Row, Skeleton, Space, Statistic, Typography } from "antd";
import { Client, ClientLevel } from "../../domain/client";
import { NewFollowUpInput, FollowUpRecord } from "../../domain/followUp";
import { Holding } from "../../domain/holding";
import { Product } from "../../domain/product";
import { fetchClients, simulateNextClientRequestFailure } from "../../services/clientService";
import { createFollowUp, fetchFollowUps, simulateNextCreateFollowUpFailure } from "../../services/followUpService";
import { fetchHoldings } from "../../services/holdingService";
import { fetchProducts } from "../../services/productService";
import { ClientDetailDrawer } from "./components/ClientDetailDrawer";
import { ClientFilters } from "./components/ClientFilters";
import { ClientList } from "./components/ClientList";
import { ClientListItem, ClientProfile, EnrichedFollowUpRecord, EnrichedHolding } from "./types";

type LoadState = "idle" | "loading" | "success" | "error";

const ALL_OPTION = "全部";
const ACTIVE_POSITION_STATUS = "持有中";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function sortRecordsByDateDesc<T extends { date: string }>(records: T[]) {
  return [...records].sort((left, right) => parseDate(right.date).getTime() - parseDate(left.date).getTime());
}

export function ClientManagementPage() {
  const { message } = AntApp.useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<ClientLevel | typeof ALL_OPTION>(ALL_OPTION);
  const [selectedOwner, setSelectedOwner] = useState<string | typeof ALL_OPTION>(ALL_OPTION);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  useEffect(() => {
    void loadClientWorkspace();
  }, []);

  const owners = useMemo(() => {
    return Array.from(new Set(clients.map((client) => client.owner))).sort((left, right) => left.localeCompare(right, "zh-CN"));
  }, [clients]);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product] as const));
  }, [products]);

  const enrichedHoldingsByClientId = useMemo(() => {
    const holdingsMap = new Map<string, EnrichedHolding[]>();

    for (const holding of holdings) {
      const clientHoldings = holdingsMap.get(holding.clientId) ?? [];
      clientHoldings.push({
        ...holding,
        product: productsById.get(holding.productId) ?? null
      });
      holdingsMap.set(holding.clientId, clientHoldings);
    }

    return holdingsMap;
  }, [holdings, productsById]);

  const enrichedFollowUpsByClientId = useMemo(() => {
    const followUpMap = new Map<string, EnrichedFollowUpRecord[]>();

    for (const record of sortRecordsByDateDesc(followUps)) {
      const clientFollowUps = followUpMap.get(record.clientId) ?? [];
      clientFollowUps.push({
        ...record,
        relatedProducts: record.relatedProductIds
          .map((productId) => productsById.get(productId))
          .filter((product): product is Product => product !== undefined)
      });
      followUpMap.set(record.clientId, clientFollowUps);
    }

    return followUpMap;
  }, [followUps, productsById]);

  const clientListItems = useMemo<ClientListItem[]>(() => {
    return clients.map((client) => {
      const clientHoldings = enrichedHoldingsByClientId.get(client.id) ?? [];
      const clientFollowUps = enrichedFollowUpsByClientId.get(client.id) ?? [];
      const activeHoldings = clientHoldings.filter((holding) => holding.positionStatus === ACTIVE_POSITION_STATUS);
      const relatedProductNames = Array.from(
        new Set(
          clientHoldings
            .map((holding) => holding.product?.name ?? null)
            .filter((productName): productName is string => productName !== null)
        )
      );

      return {
        ...client,
        activeHoldingCount: activeHoldings.length,
        totalHoldingAmount: activeHoldings.reduce((sum, holding) => sum + holding.amount, 0),
        lastFollowUpDate: clientFollowUps[0]?.date ?? null,
        relatedProductNames
      };
    });
  }, [clients, enrichedFollowUpsByClientId, enrichedHoldingsByClientId]);

  const filteredClientListItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return clientListItems.filter((client) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [client.name, client.company, client.contact, client.owner, client.region, client.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesLevel = selectedLevel === ALL_OPTION || client.level === selectedLevel;
      const matchesOwner = selectedOwner === ALL_OPTION || client.owner === selectedOwner;

      return matchesKeyword && matchesLevel && matchesOwner;
    });
  }, [clientListItems, keyword, selectedLevel, selectedOwner]);

  useEffect(() => {
    if (selectedClientId === null) {
      setIsDetailOpen(false);
      return;
    }

    const stillVisible = filteredClientListItems.some((client) => client.id === selectedClientId);

    if (!stillVisible) {
      setSelectedClientId(null);
      setIsDetailOpen(false);
    }
  }, [filteredClientListItems, selectedClientId]);

  const selectedProfile = useMemo<ClientProfile | null>(() => {
    if (selectedClientId === null) {
      return null;
    }

    const client = clients.find((currentClient) => currentClient.id === selectedClientId);

    if (!client) {
      return null;
    }

    const clientHoldings = enrichedHoldingsByClientId.get(selectedClientId) ?? [];
    const clientFollowUps = enrichedFollowUpsByClientId.get(selectedClientId) ?? [];
    const activeHoldings = clientHoldings.filter((holding) => holding.positionStatus === ACTIVE_POSITION_STATUS);

    return {
      client,
      holdings: clientHoldings,
      followUps: clientFollowUps,
      totalHoldingAmount: activeHoldings.reduce((sum, holding) => sum + holding.amount, 0),
      activeHoldingCount: activeHoldings.length,
      lastFollowUpDate: clientFollowUps[0]?.date ?? null
    };
  }, [clients, enrichedFollowUpsByClientId, enrichedHoldingsByClientId, selectedClientId]);

  const productOptions = useMemo(() => {
    return products.map((product) => ({
      label: `${product.name} · ${product.type}`,
      value: product.id
    }));
  }, [products]);

  const summary = useMemo(() => {
    const activeClientCount = clientListItems.filter((client) => client.activeHoldingCount > 0).length;
    const followedClientCount = new Set(followUps.map((record) => record.clientId)).size;

    return {
      totalClients: clients.length,
      activeClientCount,
      followedClientCount
    };
  }, [clientListItems, clients.length, followUps]);

  async function loadClientWorkspace() {
    setLoadState("loading");
    setErrorMessage("");

    try {
      const [nextClients, nextProducts, nextHoldings, nextFollowUps] = await Promise.all([
        fetchClients(),
        fetchProducts(),
        fetchHoldings(),
        fetchFollowUps()
      ]);

      setClients(nextClients);
      setProducts(nextProducts);
      setHoldings(nextHoldings);
      setFollowUps(sortRecordsByDateDesc(nextFollowUps));
      setLoadState("success");
    } catch (error) {
      setLoadState("error");
      setErrorMessage(error instanceof Error ? error.message : "客户数据加载失败，请稍后重试。");
    }
  }

  async function handleCreateFollowUp(input: NewFollowUpInput) {
    setSubmittingFollowUp(true);

    try {
      const createdRecord = await createFollowUp(input);
      setFollowUps((currentRecords) => sortRecordsByDateDesc([createdRecord, ...currentRecords]));
      message.success("跟进记录已更新。");
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "跟进提交失败，请稍后重试。";
      message.error(failureMessage);
      throw error instanceof Error ? error : new Error(failureMessage);
    } finally {
      setSubmittingFollowUp(false);
    }
  }

  return (
    <main className="shell ant-shelf-shell">
      <Card className="shelf-hero-card" variant="borderless">
        <div className="shelf-hero-top">
          <div>
            <Typography.Text className="section-eyebrow">客户经营视图</Typography.Text>
            <Typography.Title level={1} className="shelf-hero-title">
              客户管理
            </Typography.Title>
            <Typography.Paragraph className="shelf-hero-copy">
              将客户档案、持仓关系和跟进记录放在同一操作面中，帮助销售快速定位目标客户并完成后续推进。
            </Typography.Paragraph>
          </div>

          <Space className="shelf-hero-actions" size={[12, 12]} wrap>
            <Button size="large" onClick={() => void loadClientWorkspace()}>
              刷新数据
            </Button>
            <Button
              size="large"
              onClick={() => {
                simulateNextCreateFollowUpFailure();
                message.info("下一次跟进提交将模拟失败。");
              }}
              disabled={loadState !== "success"}
            >
              模拟提交失败
            </Button>
            <Button
              size="large"
              danger
              onClick={() => {
                simulateNextClientRequestFailure();
                void loadClientWorkspace();
              }}
            >
              模拟加载失败
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="已建档客户" value={summary.totalClients} suffix="位" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="在持客户" value={summary.activeClientCount} suffix="位" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="已跟进客户" value={summary.followedClientCount} suffix="位" />
            </Card>
          </Col>
        </Row>
      </Card>

      <ClientFilters
        keyword={keyword}
        selectedLevel={selectedLevel}
        selectedOwner={selectedOwner}
        owners={owners}
        onKeywordChange={setKeyword}
        onLevelChange={setSelectedLevel}
        onOwnerChange={setSelectedOwner}
      />

      {loadState === "loading" && (
        <section className="loading-grid" aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`client-loading-${index}`} className="shelf-section-card" variant="borderless">
              <Skeleton active title={{ width: "42%" }} paragraph={{ rows: 5 }} />
            </Card>
          ))}
        </section>
      )}

      {loadState === "error" && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Alert
              type="error"
              showIcon
              title="加载失败"
              description={errorMessage}
              action={
                <Button type="primary" onClick={() => void loadClientWorkspace()}>
                  重新加载
                </Button>
              }
            />
          </div>
        </Card>
      )}

      {loadState === "success" && clients.length === 0 && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Empty description="当前没有可展示的客户">
              <Typography.Text className="empty-copy">请补充客户、持仓和跟进数据后再查看客户管理模块。</Typography.Text>
            </Empty>
          </div>
        </Card>
      )}

      {loadState === "success" && clients.length > 0 && filteredClientListItems.length === 0 && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Empty description="没有匹配到客户">
              <Typography.Text className="empty-copy">请调整关键词、客户等级或负责人后重试。</Typography.Text>
            </Empty>
          </div>
        </Card>
      )}

      {loadState === "success" && filteredClientListItems.length > 0 && (
        <ClientList
          clients={filteredClientListItems}
          selectedClientId={selectedClientId}
          onSelectClient={(clientId) => {
            setSelectedClientId(clientId);
            setIsDetailOpen(true);
          }}
        />
      )}

      <ClientDetailDrawer
        profile={selectedProfile}
        open={isDetailOpen}
        submittingFollowUp={submittingFollowUp}
        productOptions={productOptions}
        onClose={() => setIsDetailOpen(false)}
        onCreateFollowUp={handleCreateFollowUp}
      />
    </main>
  );
}
