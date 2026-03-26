import { Empty, List, Space, Tag, Typography } from "antd";
import { formatAmountInWan } from "../../../shared/formatters";
import { EnrichedHolding } from "../types";

interface ClientHoldingsPanelProps {
  holdings: EnrichedHolding[];
}

export function ClientHoldingsPanel({ holdings }: ClientHoldingsPanelProps) {
  if (holdings.length === 0) {
    return <Empty description="当前没有可展示的持仓记录" />;
  }

  return (
    <List
      dataSource={holdings}
      renderItem={(holding) => (
        <List.Item className="client-detail-list-item">
          <div className="client-detail-list-content">
            <div>
              <Typography.Title level={5} className="client-detail-item-title">
                {holding.product?.name ?? "未知产品"}
              </Typography.Title>
              <Space size={[8, 8]} wrap>
                <Typography.Text className="product-card-meta">
                  {holding.product?.type ?? "未匹配产品类型"}
                </Typography.Text>
                <Tag variant="filled" className={`holding-status-tag holding-status-tag--${holding.positionStatus}`}>
                  {holding.positionStatus}
                </Tag>
              </Space>
            </div>
            <Typography.Title level={5} className="client-detail-amount">
              {formatAmountInWan(holding.amount)}
            </Typography.Title>
          </div>
        </List.Item>
      )}
    />
  );
}
