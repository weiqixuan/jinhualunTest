import type { KeyboardEvent } from "react";
import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import { formatAmountInWan, formatDate } from "../../../shared/formatters";
import { ClientListItem } from "../types";

interface ClientListProps {
  clients: ClientListItem[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
}

export function ClientList({ clients, selectedClientId, onSelectClient }: ClientListProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, clientId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectClient(clientId);
    }
  };

  return (
    <Card className="shelf-section-card product-list-shell" variant="borderless" aria-label="客户列表">
      <div className="product-list-header">
        <div>
          <Typography.Text className="section-eyebrow">客户管理</Typography.Text>
          <Typography.Title level={3}>客户目录</Typography.Title>
        </div>
        <Typography.Text className="list-count">共 {clients.length} 位客户</Typography.Text>
      </div>

      <div className="client-grid" role="list">
        {clients.map((client, index) => {
          const isActive = selectedClientId === client.id;

          return (
            <button
              key={client.id}
              type="button"
              className="product-card-trigger"
              aria-pressed={isActive}
              onClick={() => onSelectClient(client.id)}
              onKeyDown={(event) => handleKeyDown(event, client.id)}
            >
              <Card
                variant="borderless"
                hoverable
                className={`client-card-ant${isActive ? " client-card-ant--active" : ""}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="client-card-header">
                  <div>
                    <Typography.Title level={4} className="product-card-title">
                      {client.name}
                    </Typography.Title>
                    <Typography.Text className="product-card-meta">{client.company}</Typography.Text>
                  </div>
                  <Tag variant="filled" className={`client-level-tag client-level-tag--${client.level}`}>
                    {client.level}
                  </Tag>
                </div>

                <div className="client-meta-grid">
                  <div className="client-meta-row">
                    <span className="metric-surface__label">负责人</span>
                    <strong>{client.owner}</strong>
                  </div>
                  <div className="client-meta-row">
                    <span className="metric-surface__label">联系方式</span>
                    <strong>{client.contact}</strong>
                  </div>
                  <div className="client-meta-row">
                    <span className="metric-surface__label">最近跟进</span>
                    <strong>{client.lastFollowUpDate ? formatDate(client.lastFollowUpDate) : "暂无记录"}</strong>
                  </div>
                </div>

                <Row gutter={[12, 12]} className="metric-row">
                  <Col xs={24} sm={12}>
                    <div className="metric-surface">
                      <Statistic title="在持产品" value={client.activeHoldingCount} suffix="只" />
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="metric-surface">
                      <Typography.Text className="metric-surface__label">持仓规模</Typography.Text>
                      <Typography.Title level={4} className="client-amount-title">
                        {formatAmountInWan(client.totalHoldingAmount)}
                      </Typography.Title>
                    </div>
                  </Col>
                </Row>

                <Space className="product-tag-group" size={[8, 8]} wrap>
                  {client.relatedProductNames.length > 0 ? (
                    client.relatedProductNames.map((name) => (
                      <Typography.Text key={name} className="chip-text">
                        {name}
                      </Typography.Text>
                    ))
                  ) : (
                    <Typography.Text className="empty-copy">暂无关联产品</Typography.Text>
                  )}
                </Space>
              </Card>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
