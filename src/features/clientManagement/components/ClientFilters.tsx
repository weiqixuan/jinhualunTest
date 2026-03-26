import { Card, Col, Input, Row, Select, Space, Typography } from "antd";
import { ClientLevel, clientLevels } from "../../../domain/client";

interface ClientFiltersProps {
  keyword: string;
  selectedLevel: ClientLevel | "全部";
  selectedOwner: string | "全部";
  owners: string[];
  onKeywordChange: (value: string) => void;
  onLevelChange: (value: ClientLevel | "全部") => void;
  onOwnerChange: (value: string | "全部") => void;
}

export function ClientFilters({
  keyword,
  selectedLevel,
  selectedOwner,
  owners,
  onKeywordChange,
  onLevelChange,
  onOwnerChange
}: ClientFiltersProps) {
  const levelOptions = [
    { label: "全部等级", value: "全部" },
    ...clientLevels.map((level) => ({ label: level, value: level }))
  ];

  const ownerOptions = [{ label: "全部负责人", value: "全部" }, ...owners.map((owner) => ({ label: owner, value: owner }))];

  return (
    <Card className="shelf-section-card shelf-filter-card" variant="borderless">
      <Space orientation="vertical" size={16} style={{ display: "flex" }}>
        <div>
          <Typography.Text className="section-eyebrow">客户筛选</Typography.Text>
          <Typography.Title level={4}>快速定位目标客户</Typography.Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={14}>
            <div className="filter-field">
              <Typography.Text className="field-caption">搜索客户</Typography.Text>
              <Input
                allowClear
                size="large"
                placeholder="输入客户姓名、机构、联系方式或负责人"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="filter-field">
              <Typography.Text className="field-caption">客户等级</Typography.Text>
              <Select
                size="large"
                value={selectedLevel}
                options={levelOptions}
                onChange={(value) => onLevelChange(value as ClientLevel | "全部")}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="filter-field">
              <Typography.Text className="field-caption">负责人</Typography.Text>
              <Select
                size="large"
                value={selectedOwner}
                options={ownerOptions}
                onChange={(value) => onOwnerChange(value as string | "全部")}
              />
            </div>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}
