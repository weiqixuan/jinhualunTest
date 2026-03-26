import type { KeyboardEvent } from "react";
import { Card, Col, Row, Space, Statistic, Typography } from "antd";
import { Product } from "../../../domain/product";
import { StatusBadge } from "../../../shared/StatusBadge";

interface ProductListProps {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (product: Product) => void;
}

export function ProductList({ products, selectedProductId, onSelectProduct }: ProductListProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, product: Product) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectProduct(product);
    }
  };

  return (
    <Card className="shelf-section-card product-list-shell" variant="borderless" aria-label="产品列表">
      <div className="product-list-header">
        <div>
          <Typography.Text className="section-eyebrow">产品货架</Typography.Text>
          <Typography.Title level={3}>在售与历史产品</Typography.Title>
        </div>
        <Typography.Text className="list-count">共 {products.length} 只产品</Typography.Text>
      </div>
      <div className="product-grid" role="list">
        {products.map((product, index) => {
          const isActive = selectedProductId === product.id;

          return (
            <button
              key={product.id}
              type="button"
              className="product-card-trigger"
              aria-pressed={isActive}
              onClick={() => onSelectProduct(product)}
              onKeyDown={(event) => handleKeyDown(event, product)}
            >
              <Card
                variant="borderless"
                hoverable
                className={`product-card-ant${isActive ? " product-card-ant--active" : ""}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="product-card-header">
                  <div>
                    <Typography.Title level={4} className="product-card-title">
                      {product.name}
                    </Typography.Title>
                    <Typography.Text className="product-card-meta">
                      {product.type} · {product.manager}
                    </Typography.Text>
                  </div>
                  <StatusBadge status={product.status} />
                </div>

                <Row gutter={[12, 12]} className="metric-row">
                  <Col xs={24} sm={8}>
                    <div className="metric-surface">
                      <Statistic title="最新净值" value={product.nav} precision={4} />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="metric-surface">
                      <Statistic title="成立规模" value={product.aum} precision={1} suffix="亿元" />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="metric-surface metric-surface--compact">
                      <span className="metric-surface__label">风险等级</span>
                      <strong>{product.riskLevel}</strong>
                    </div>
                  </Col>
                </Row>

                <Space className="product-tag-group" size={[8, 8]} wrap>
                  {product.tags.map((tag) => (
                    <Typography.Text key={tag} className="chip-text">
                      {tag}
                    </Typography.Text>
                  ))}
                </Space>
              </Card>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
