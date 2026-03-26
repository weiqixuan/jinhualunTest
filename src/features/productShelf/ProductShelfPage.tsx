import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Row, Skeleton, Space, Statistic, Typography } from "antd";
import { Product, ProductStatus, ProductType } from "../../domain/product";
import { ProductDetailPanel } from "./components/ProductDetailPanel";
import { ProductFilters } from "./components/ProductFilters";
import { fetchProducts, simulateNextProductsRequestFailure } from "../../services/productService";
import { ProductList } from "./components/ProductList";

type LoadState = "idle" | "loading" | "success" | "error";

export function ProductShelfPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState<ProductType | "全部">("全部");
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "全部">("全部");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [product.name, product.manager, product.type, product.status, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesType = selectedType === "全部" || product.type === selectedType;
      const matchesStatus = selectedStatus === "全部" || product.status === selectedStatus;

      return matchesKeyword && matchesType && matchesStatus;
    });
  }, [keyword, products, selectedStatus, selectedType]);

  useEffect(() => {
    if (filteredProducts.length === 0 || selectedProductId === null) {
      setSelectedProductId(null);
      setIsDetailOpen(false);
      return;
    }

    const stillExists = filteredProducts.some((product) => product.id === selectedProductId);

    if (!stillExists) {
      setSelectedProductId(null);
      setIsDetailOpen(false);
    }
  }, [filteredProducts, selectedProductId]);

  const selectedProduct = filteredProducts.find((product) => product.id === selectedProductId) ?? null;

  const summary = useMemo(() => {
    const runningCount = products.filter((product) => product.status === "运作中").length;
    const totalAum = products.reduce((sum, product) => sum + product.aum, 0);

    return {
      totalCount: products.length,
      runningCount,
      totalAum: Number(totalAum.toFixed(1))
    };
  }, [products]);

  async function loadProducts() {
    setLoadState("loading");
    setErrorMessage("");

    try {
      const response = await fetchProducts();
      setProducts(response);
      setLoadState("success");
    } catch (error) {
      setLoadState("error");
      setErrorMessage(error instanceof Error ? error.message : "产品数据加载失败，请稍后重试。");
    }
  }

  return (
    <main className="shell ant-shelf-shell">
      <Card className="shelf-hero-card" variant="borderless">
        <div className="shelf-hero-top">
          <div>
            <Typography.Text className="section-eyebrow">资管渠道销售内部工具</Typography.Text>
            <Typography.Title level={1} className="shelf-hero-title">
              产品货架
            </Typography.Title>
            <Typography.Paragraph className="shelf-hero-copy">
              基于稳定组件库重构的基金产品工作台，强调搜索效率、组合筛选和侧边详情浏览体验。
            </Typography.Paragraph>
          </div>

          <Space className="shelf-hero-actions" size={[12, 12]} wrap>
            <Button size="large" onClick={() => void loadProducts()}>
              刷新数据
            </Button>
            <Button
              size="large"
              danger
              onClick={() => {
                simulateNextProductsRequestFailure();
                void loadProducts();
              }}
            >
              模拟加载失败
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="在架产品" value={summary.totalCount} suffix="只" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="运作中产品" value={summary.runningCount} suffix="只" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="hero-stat-card" variant="borderless">
              <Statistic title="合计规模" value={summary.totalAum} precision={1} suffix="亿元" />
            </Card>
          </Col>
        </Row>
      </Card>

      <ProductFilters
        keyword={keyword}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onKeywordChange={setKeyword}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
      />

      {loadState === "loading" && (
        <section className="loading-grid" aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`loading-${index}`} className="shelf-section-card" variant="borderless">
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
                <Button type="primary" onClick={() => void loadProducts()}>
                  重新加载
                </Button>
              }
            />
          </div>
        </Card>
      )}

      {loadState === "success" && products.length === 0 && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Empty description="当前没有可展示的产品">
              <Typography.Text className="empty-copy">请补充产品数据后再查看产品货架。</Typography.Text>
            </Empty>
          </div>
        </Card>
      )}

      {loadState === "success" && products.length > 0 && filteredProducts.length === 0 && (
        <Card className="shelf-feedback-card" variant="borderless">
          <div className="feedback-inline">
            <Empty description="没有匹配到产品">
              <Typography.Text className="empty-copy">
                请调整关键字、产品类型或产品状态后重试。
              </Typography.Text>
            </Empty>
          </div>
        </Card>
      )}

      {loadState === "success" && filteredProducts.length > 0 && (
        <ProductList
          products={filteredProducts}
          selectedProductId={selectedProductId}
          onSelectProduct={(product) => {
            setSelectedProductId(product.id);
            setIsDetailOpen(true);
          }}
        />
      )}

      <ProductDetailPanel product={selectedProduct} open={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </main>
  );
}
