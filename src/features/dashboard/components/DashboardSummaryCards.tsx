import { Card, Typography } from "antd";
import { DashboardSummary } from "../types";

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const cards = [
    {
      title: "在架产品",
      value: `${summary.onShelfProductCount}`,
      suffix: "只",
      note: "含募集中与运作中产品"
    },
    {
      title: "在架规模",
      value: summary.onShelfAum.toFixed(1),
      suffix: "亿元",
      note: "按产品规模口径汇总"
    },
    {
      title: "活跃客户",
      value: `${summary.activeClientCount}`,
      suffix: "位",
      note: "至少持有 1 只在持产品"
    },
    {
      title: "核心覆盖率",
      value: summary.coreCoverageRate.toFixed(0),
      suffix: "%",
      note: `${summary.coreCoveredCount}/${summary.coreClientCount} 位核心客户已覆盖`
    }
  ];

  return (
    <div className="dashboard-summary-grid">
      {cards.map((card) => (
        <Card key={card.title} variant="borderless" className="dashboard-summary-card">
          <Typography.Text className="dashboard-summary-label">{card.title}</Typography.Text>
          <div className="dashboard-summary-value-row">
            <strong className="dashboard-summary-value">{card.value}</strong>
            <span className="dashboard-summary-suffix">{card.suffix}</span>
          </div>
          <Typography.Text className="dashboard-summary-note">{card.note}</Typography.Text>
        </Card>
      ))}
    </div>
  );
}
