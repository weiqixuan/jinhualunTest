import { Card, Col, Descriptions, Drawer, Row, Space, Statistic, Typography } from "antd";
import { NewFollowUpInput } from "../../../domain/followUp";
import { formatAmountInWan, formatDate } from "../../../shared/formatters";
import { ClientProfile } from "../types";
import { ClientHoldingsPanel } from "./ClientHoldingsPanel";
import { FollowUpComposer } from "./FollowUpComposer";
import { FollowUpList } from "./FollowUpList";

interface ClientDetailDrawerProps {
  profile: ClientProfile | null;
  open: boolean;
  submittingFollowUp: boolean;
  productOptions: Array<{ label: string; value: string }>;
  onClose: () => void;
  onCreateFollowUp: (input: NewFollowUpInput) => Promise<void>;
}

export function ClientDetailDrawer({
  profile,
  open,
  submittingFollowUp,
  productOptions,
  onClose,
  onCreateFollowUp
}: ClientDetailDrawerProps) {
  if (!profile) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title="客户详情"
      rootClassName="client-detail-root"
      className="client-detail-drawer"
    >
      <Space orientation="vertical" size={16} style={{ display: "flex" }}>
        <Card className="detail-hero-card" variant="borderless">
          <Typography.Text className="section-eyebrow">客户详情</Typography.Text>
          <Typography.Title level={3}>{profile.client.name}</Typography.Title>
          <Typography.Paragraph className="detail-hero-copy">
            {profile.client.company} · {profile.client.organizationType} · {profile.client.region}
          </Typography.Paragraph>
          <Typography.Paragraph className="detail-hero-copy">{profile.client.notes}</Typography.Paragraph>
        </Card>

        <Row gutter={[12, 12]}>
          <Col span={8}>
            <Card className="detail-stat-card" variant="borderless">
              <Statistic title="在持产品" value={profile.activeHoldingCount} suffix="只" />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="detail-stat-card" variant="borderless">
              <Statistic title="持仓规模" value={profile.totalHoldingAmount} suffix="万元" />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="detail-stat-card" variant="borderless">
              <Typography.Text className="metric-surface__label">最近跟进</Typography.Text>
              <Typography.Title level={4} className="client-amount-title">
                {profile.lastFollowUpDate ? formatDate(profile.lastFollowUpDate) : "暂无"}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <Card className="detail-card" title="客户基础信息" variant="borderless">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="客户等级">{profile.client.level}</Descriptions.Item>
            <Descriptions.Item label="内部负责人">{profile.client.owner}</Descriptions.Item>
            <Descriptions.Item label="联系方式">{profile.client.contact}</Descriptions.Item>
            <Descriptions.Item label="所属机构">{profile.client.company}</Descriptions.Item>
            <Descriptions.Item label="覆盖区域">{profile.client.region}</Descriptions.Item>
            <Descriptions.Item label="当前持仓">{formatAmountInWan(profile.totalHoldingAmount)}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="detail-card" title="持仓产品" variant="borderless">
          <ClientHoldingsPanel holdings={profile.holdings} />
        </Card>

        <Card className="detail-card" title="跟进记录" variant="borderless">
          <FollowUpList followUps={profile.followUps} />
        </Card>

        <Card className="detail-card" title="新增跟进" variant="borderless">
          <FollowUpComposer
            clientId={profile.client.id}
            productOptions={productOptions}
            submitting={submittingFollowUp}
            onSubmit={onCreateFollowUp}
          />
        </Card>
      </Space>
    </Drawer>
  );
}
