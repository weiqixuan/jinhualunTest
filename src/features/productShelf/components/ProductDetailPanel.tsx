import { Card, Col, Descriptions, Drawer, List, Row, Space, Statistic, Tag, Typography } from "antd";
import { Product } from "../../../domain/product";
import { formatDate } from "../../../shared/formatters";
import { StatusBadge } from "../../../shared/StatusBadge";

interface ProductDetailPanelProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailPanel({ product, open, onClose }: ProductDetailPanelProps) {
  if (!product) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title="产品详情"
      extra={<StatusBadge status={product.status} />}
      rootClassName="product-detail-root"
      className="product-detail-drawer"
    >
      <Space orientation="vertical" size={16} style={{ display: "flex" }}>
        <Card className="detail-hero-card" variant="borderless">
          <Typography.Text className="section-eyebrow">产品详情</Typography.Text>
          <Typography.Title level={3}>{product.name}</Typography.Title>
          <Typography.Paragraph className="detail-hero-copy">{product.investmentFocus}</Typography.Paragraph>
        </Card>

        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Card className="detail-stat-card" variant="borderless">
              <Statistic title="最新净值" value={product.nav} precision={4} />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="detail-stat-card" variant="borderless">
              <Statistic title="成立规模" value={product.aum} precision={1} suffix="亿元" />
            </Card>
          </Col>
        </Row>

        <Card className="detail-card" title="关键信息" variant="borderless">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="产品类型">{product.type}</Descriptions.Item>
            <Descriptions.Item label="基金经理">{product.manager}</Descriptions.Item>
            <Descriptions.Item label="风险等级">{product.riskLevel}</Descriptions.Item>
            <Descriptions.Item label="成立日期">{formatDate(product.inceptionDate)}</Descriptions.Item>
            <Descriptions.Item label="币种">{product.currency}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="detail-card" title="产品标签" variant="borderless">
          <div className="detail-tag-group">
            {product.tags.map((tag) => (
              <Tag key={tag} variant="filled">
                {tag}
              </Tag>
            ))}
          </div>
        </Card>

        <Card className="detail-card" title="销售推荐话术" variant="borderless">
          <List
            className="detail-list"
            dataSource={product.sellingPoints}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Card>
      </Space>
    </Drawer>
  );
}
