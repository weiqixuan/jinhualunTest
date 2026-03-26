import { Card, Empty, Tag, Typography } from "antd";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { ProductTypeScaleItem } from "../types";

interface ProductTypeScaleChartProps {
  items: ProductTypeScaleItem[];
}

const TYPE_COLORS = ["#0f6c81", "#2f8ea4", "#70a9b8", "#aac8d1"];

function formatAum(value: number) {
  return `${value.toFixed(1)} 亿元`;
}

export function ProductTypeScaleChart({ items }: ProductTypeScaleChartProps) {
  const totalAum = useMemo(() => items.reduce((sum, item) => sum + item.aum, 0), [items]);

  const option = useMemo<EChartsOption>(() => {
    return {
      color: TYPE_COLORS,
      aria: {
        enabled: true,
        description: "在架产品按类型的规模占比图。"
      },
      title: {
        text: formatAum(totalAum),
        subtext: "在架规模",
        left: "39%",
        top: "37%",
        textAlign: "center",
        textStyle: {
          color: "#16232c",
          fontSize: 20,
          fontWeight: 700
        },
        subtextStyle: {
          color: "#5a7080",
          fontSize: 12
        }
      },
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          const current = Array.isArray(params) ? params[0] : params;
          const data = current.data as
            | { displayLabel: string; aum: number; productCount: number; share: number }
            | undefined;

          if (!data) {
            return "";
          }

          return [
            `<strong>${data.displayLabel}</strong>`,
            `在架规模：${formatAum(data.aum)}`,
            `产品数量：${data.productCount} 只`,
            `规模占比：${data.share.toFixed(0)}%`
          ].join("<br/>");
        }
      },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: "#3d5563"
        }
      },
      series: [
        {
          type: "pie",
          radius: ["50%", "72%"],
          center: ["40%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 3
          },
          label: {
            color: "#24404d",
            formatter: "{b}\n{d}%",
            fontWeight: 600
          },
          labelLine: {
            length: 12,
            length2: 10
          },
          data: items.map((item, index) => ({
            value: item.aum,
            name: item.label,
            displayLabel: item.label,
            aum: item.aum,
            productCount: item.productCount,
            share: item.share,
            itemStyle: {
              color: TYPE_COLORS[index % TYPE_COLORS.length]
            }
          }))
        }
      ]
    };
  }, [items, totalAum]);

  return (
    <Card className="dashboard-chart-card" variant="borderless">
      <div className="dashboard-chart-header">
        <div>
          <Typography.Text className="section-eyebrow">产品结构</Typography.Text>
          <Typography.Title level={3} className="dashboard-chart-title">
            在架产品规模占比
          </Typography.Title>
          <Typography.Paragraph className="dashboard-chart-copy">
            用规模口径判断当前更值得投入销售资源的产品类型，避免只看产品数量。
          </Typography.Paragraph>
        </div>
        <Tag variant="filled" className="dashboard-chart-tag">
          支撑主推判断
        </Tag>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-chart-empty">
          <Empty description="暂无在架产品结构数据" />
        </div>
      ) : (
        <ReactECharts option={option} notMerge lazyUpdate style={{ height: 360, width: "100%" }} />
      )}

      <Typography.Text className="dashboard-chart-insight">
        {items[0]
          ? `${items[0].label} 当前占比最高，规模 ${formatAum(items[0].aum)}。`
          : "暂无可提炼的结构结论。"}
      </Typography.Text>
    </Card>
  );
}
