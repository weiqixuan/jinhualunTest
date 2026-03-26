import { Card, Empty, Tag, Typography } from "antd";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { ProductStatusDistributionItem } from "../types";

interface ProductStatusChartProps {
  items: ProductStatusDistributionItem[];
}

const STATUS_COLORS = ["#0f6c81", "#42a26b", "#9aaab5"];

function formatAum(value: number) {
  return `${value.toFixed(1)} 亿元`;
}

export function ProductStatusChart({ items }: ProductStatusChartProps) {
  const option = useMemo<EChartsOption>(() => {
    return {
      color: STATUS_COLORS,
      aria: {
        enabled: true,
        description: "产品状态分布图。"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        formatter: (params) => {
          const current = Array.isArray(params) ? params[0] : params;
          const data = current?.data as { productCount: number; aum: number } | undefined;
          const axisLabel =
            current && typeof current === "object" && "axisValue" in current
              ? String(current.axisValue)
              : current?.name ?? "";

          if (!current || !data) {
            return "";
          }

          return [
            `<strong>${axisLabel}</strong>`,
            `产品数量：${data.productCount} 只`,
            `涉及规模：${formatAum(data.aum)}`
          ].join("<br/>");
        }
      },
      grid: {
        top: 18,
        right: 20,
        bottom: 28,
        left: 28
      },
      xAxis: {
        type: "category",
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: "rgba(173, 194, 207, 0.44)"
          }
        },
        axisLabel: {
          color: "#3d5563",
          fontWeight: 600
        },
        data: items.map((item) => item.label)
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: {
          color: "#5a7080"
        },
        splitLine: {
          lineStyle: {
            color: "rgba(173, 194, 207, 0.28)"
          }
        }
      },
      series: [
        {
          type: "bar",
          barWidth: 44,
          label: {
            show: true,
            position: "top",
            color: "#24404d",
            fontWeight: 600
          },
          itemStyle: {
            borderRadius: [10, 10, 0, 0]
          },
          data: items.map((item, index) => ({
            value: item.productCount,
            productCount: item.productCount,
            aum: item.aum,
            itemStyle: {
              color: STATUS_COLORS[index % STATUS_COLORS.length]
            }
          }))
        }
      ]
    };
  }, [items]);

  return (
    <Card className="dashboard-chart-card dashboard-chart-card--wide" variant="borderless">
      <div className="dashboard-chart-header">
        <div>
          <Typography.Text className="section-eyebrow">状态盘点</Typography.Text>
          <Typography.Title level={3} className="dashboard-chart-title">
            产品状态分布
          </Typography.Title>
          <Typography.Paragraph className="dashboard-chart-copy">
            辅助判断当前产品池是更偏在架推动，还是需要补充新发与历史沉淀产品的沟通节奏。
          </Typography.Paragraph>
        </div>
        <Tag variant="filled" className="dashboard-chart-tag">
          辅助看板
        </Tag>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-chart-empty">
          <Empty description="暂无产品状态数据" />
        </div>
      ) : (
        <ReactECharts option={option} notMerge lazyUpdate style={{ height: 300, width: "100%" }} />
      )}

      <Typography.Text className="dashboard-chart-insight">
        {items[1]
          ? `${items[1].label} 产品当前共 ${items[1].productCount} 只，可作为稳定维护盘的主要来源。`
          : "暂无可提炼的状态分布结论。"}
      </Typography.Text>
    </Card>
  );
}
