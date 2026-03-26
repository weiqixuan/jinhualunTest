import { useEffect, useState } from "react";
import { Alert, Button, Card, Empty, Skeleton, Space, Typography } from "antd";
import { fetchClients } from "../../services/clientService";
import { fetchFollowUps } from "../../services/followUpService";
import { fetchHoldings } from "../../services/holdingService";
import { fetchProducts, simulateNextProductsRequestFailure } from "../../services/productService";
import { aggregateDashboard } from "./aggregateDashboard";
import { DashboardSummaryCards } from "./components/DashboardSummaryCards";
import { ClientCoverageChart } from "./components/ClientCoverageChart";
import { ProductStatusChart } from "./components/ProductStatusChart";
import { ProductTypeScaleChart } from "./components/ProductTypeScaleChart";
import { DashboardViewModel } from "./types";

type LoadState = "idle" | "loading" | "success" | "error";

function formatRefreshTime(value: Date | null) {
  if (!value) {
    return "尚未完成加载";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(value);
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewModel | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshErrorMessage, setRefreshErrorMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    const hasCachedDashboard = dashboard !== null;

    setIsRefreshing(true);
    setRefreshErrorMessage("");

    if (!hasCachedDashboard) {
      setLoadState("loading");
      setErrorMessage("");
    }

    try {
      const [products, clients, holdings, followUps] = await Promise.all([
        fetchProducts(),
        fetchClients(),
        fetchHoldings(),
        fetchFollowUps()
      ]);

      setDashboard(
        aggregateDashboard({
          products,
          clients,
          holdings,
          followUps
        })
      );
      setLastUpdatedAt(new Date());
      setLoadState("success");
      setErrorMessage("");
    } catch (error) {
      const nextErrorMessage = error instanceof Error ? error.message : "数据概览加载失败，请稍后重试。";

      if (hasCachedDashboard) {
        setRefreshErrorMessage(nextErrorMessage);
      } else {
        setDashboard(null);
        setLoadState("error");
        setErrorMessage(nextErrorMessage);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <main className="shell ant-shelf-shell">
      <Card className="shelf-hero-card" variant="borderless">
        <div className="shelf-hero-top">
          <div>
            <Typography.Text className="section-eyebrow">业务全景</Typography.Text>
            <Typography.Title level={1} className="shelf-hero-title">
              数据概览 Dashboard
            </Typography.Title>
            <Typography.Paragraph className="shelf-hero-copy">
              将产品结构、客户覆盖和状态盘点放在同一屏中，帮助销售先判断方向，再进入产品或客户细节。
            </Typography.Paragraph>
            <Typography.Text className="dashboard-refresh-note">
              最近成功刷新：{formatRefreshTime(lastUpdatedAt)}
            </Typography.Text>
            {refreshErrorMessage && (
              <Typography.Text className="dashboard-refresh-note dashboard-refresh-note--warning">
                最新拉取失败，当前展示上次成功快照。
              </Typography.Text>
            )}
          </div>

          <Space className="shelf-hero-actions" size={[12, 12]} wrap>
            <Button size="large" loading={isRefreshing} onClick={() => void loadDashboard()}>
              刷新概览
            </Button>
            <Button
              size="large"
              danger
              loading={isRefreshing}
              onClick={() => {
                simulateNextProductsRequestFailure();
                void loadDashboard();
              }}
            >
              模拟加载失败
            </Button>
          </Space>
        </div>

        {dashboard ? (
          <>
            <DashboardSummaryCards summary={dashboard.summary} />
            <div className="dashboard-insight-grid">
              {dashboard.highlights.map((highlight) => (
                <div key={highlight.title} className="dashboard-insight-card">
                  <Typography.Text className="dashboard-insight-title">{highlight.title}</Typography.Text>
                  <Typography.Paragraph className="dashboard-insight-copy">{highlight.description}</Typography.Paragraph>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="dashboard-summary-skeleton">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`summary-loading-${index}`} className="dashboard-summary-card" variant="borderless">
                <Skeleton active title={{ width: "48%" }} paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        )}
      </Card>

      {refreshErrorMessage && dashboard && (
        <Card className="shelf-feedback-card" variant="borderless">
          <Alert
            type="warning"
            showIcon
            title="刷新失败，当前展示上次成功数据"
            description={refreshErrorMessage}
            action={
              <Button type="primary" onClick={() => void loadDashboard()}>
                重新拉取
              </Button>
            }
          />
        </Card>
      )}

      {(loadState === "idle" || (loadState === "loading" && dashboard === null)) && (
        <section className="loading-grid" aria-live="polite">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`dashboard-loading-${index}`} className="shelf-section-card" variant="borderless">
              <Skeleton active title={{ width: "42%" }} paragraph={{ rows: 8 }} />
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
              title="数据概览加载失败"
              description={errorMessage}
              action={
                <Button type="primary" onClick={() => void loadDashboard()}>
                  重新加载
                </Button>
              }
            />
          </div>
        </Card>
      )}

      {loadState === "success" && dashboard && dashboard.summary.totalClientCount === 0 && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Empty description="暂无可展示的数据概览">
              <Typography.Text className="empty-copy">请先补充产品、客户、持仓与跟进数据，再查看仪表盘。</Typography.Text>
            </Empty>
          </div>
        </Card>
      )}

      {dashboard && dashboard.summary.totalClientCount > 0 && (
        <section className="dashboard-chart-grid">
          <ProductTypeScaleChart items={dashboard.productTypeScale} />
          <ClientCoverageChart items={dashboard.clientCoverageRanking} />
          <ProductStatusChart items={dashboard.productStatusDistribution} />
        </section>
      )}
    </main>
  );
}
