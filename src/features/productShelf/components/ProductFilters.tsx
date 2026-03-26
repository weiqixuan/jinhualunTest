import { ChangeEvent } from "react";
import { Card, Col, Input, Row, Space, Select, Typography } from "antd";
import { productStatuses, productTypes, ProductStatus, ProductType } from "../../../domain/product";

interface ProductFiltersProps {
  keyword: string;
  selectedType: ProductType | "全部";
  selectedStatus: ProductStatus | "全部";
  onKeywordChange: (value: string) => void;
  onTypeChange: (value: ProductType | "全部") => void;
  onStatusChange: (value: ProductStatus | "全部") => void;
}

export function ProductFilters({
  keyword,
  selectedType,
  selectedStatus,
  onKeywordChange,
  onTypeChange,
  onStatusChange
}: ProductFiltersProps) {
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onKeywordChange(event.target.value);
  };

  const typeOptions = [
    { label: "全部类型", value: "全部" },
    ...productTypes.map((type) => ({ label: type, value: type }))
  ];

  const statusOptions = [
    { label: "全部状态", value: "全部" },
    ...productStatuses.map((status) => ({ label: status, value: status }))
  ];

  return (
    <Card className="shelf-section-card shelf-filter-card" variant="borderless" aria-label="产品筛选条件">
      <Space orientation="vertical" size={16} style={{ display: "flex" }}>
        <div>
          <Typography.Text className="section-eyebrow">定位目标产品</Typography.Text>
          <Typography.Title level={4}>按关键字段快速筛选</Typography.Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={14}>
            <div className="filter-field">
              <Typography.Text className="field-caption">搜索产品</Typography.Text>
              <Input
                id="product-search"
                allowClear
                size="large"
                placeholder="输入产品名称、基金经理、标签"
                value={keyword}
                onChange={handleKeywordChange}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="filter-field">
              <Typography.Text className="field-caption">产品类型</Typography.Text>
              <Select
                id="product-type"
                size="large"
                value={selectedType}
                options={typeOptions}
                onChange={(value) => onTypeChange(value as ProductType | "全部")}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="filter-field">
              <Typography.Text className="field-caption">产品状态</Typography.Text>
              <Select
                id="product-status"
                size="large"
                value={selectedStatus}
                options={statusOptions}
                onChange={(value) => onStatusChange(value as ProductStatus | "全部")}
              />
            </div>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}
