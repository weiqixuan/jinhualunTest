import { Empty, List, Space, Tag, Typography } from "antd";
import { formatDate } from "../../../shared/formatters";
import { EnrichedFollowUpRecord } from "../types";

interface FollowUpListProps {
  followUps: EnrichedFollowUpRecord[];
}

export function FollowUpList({ followUps }: FollowUpListProps) {
  if (followUps.length === 0) {
    return <Empty description="当前没有跟进记录" />;
  }

  return (
    <List
      dataSource={followUps}
      renderItem={(record) => (
        <List.Item className="client-detail-list-item">
          <div className="follow-up-item">
            <Space size={[8, 8]} wrap>
              <Typography.Text strong>{formatDate(record.date)}</Typography.Text>
              <Tag variant="filled" className="follow-up-channel-tag">
                {record.channel}
              </Tag>
            </Space>
            <Typography.Paragraph className="follow-up-content">{record.content}</Typography.Paragraph>
            <Space size={[8, 8]} wrap>
              {record.relatedProducts.map((product) => (
                <Typography.Text key={product.id} className="chip-text">
                  {product.name}
                </Typography.Text>
              ))}
            </Space>
          </div>
        </List.Item>
      )}
    />
  );
}
