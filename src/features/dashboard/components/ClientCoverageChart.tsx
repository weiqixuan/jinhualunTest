import { Card, Empty, Tag, Typography } from "antd";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { ClientCoverageItem } from "../types";

interface ClientCoverageChartProps {
  items: ClientCoverageItem[];
}

const LEVEL_COLORS: Record<string, string> = {
  核心: "#0f6c81",
  重点: "#ffb347",
  观察: "#9aaab5"
};

function formatAmountInWan(value: number) {
  return `${new Intl.NumberFormat("zh-CN").format(Math.round(value))} 万元`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "暂无记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function ClientCoverageChart({ items }: ClientCoverageChartProps) {
  const option = useMemo<EChartsOption>(() => {
    return {
      aria: {
        enabled: true,
        description: "活跃持仓客户排名图。"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        formatter: (params) => {
          const current = (Array.isArray(params) ? params[0] : params)?.data as
            | (ClientCoverageItem & { value: number })
            | undefined;

          if (!current) {
            return "";
          }

          return [
            `<strong>${current.clientName}</strong>`,
            `客户分层：${current.levelLabel}`,
            `负责人：${current.owner}`,
            `活跃持仓：${formatAmountInWan(current.holdingAmount)}`,
            `持有产品：${current.holdingProductCount} 只`,
            `最近跟进：${formatDate(current.lastFollowUpDate)}`
          ].join("<br/>");
        }
      },
      grid: {
        top: 12,
        right: 20,
        bottom: 12,
        left: 96
      },
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#5a7080"
        },
        splitLine: {
          lineStyle: {
            color: "rgba(173, 194, 207, 0.28)"
          }
        }
      },
      yAxis: {
        type: "category",
        inverse: true,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: "#24404d",
          fontWeight: 600
        },
        data: items.map((item) => item.clientName)
      },
      series: [
        {
          type: "bar",
          barWidth: 22,
          label: {
            show: true,
            position: "right",
            color: "#3d5563",
            formatter: (params) => formatAmountInWan(Number(params.value))
          },
          itemStyle: {
            borderRadius: [0, 10, 10, 0]
          },
          data: items.map((item) => ({
            ...item,
            value: item.holdingAmount,
            itemStyle: {
              color: LEVEL_COLORS[item.levelLabel] ?? "#0f6c81"
            }
          }))
        }
      ]
    };
  }, [items]);

  return (
    <Card className="dashboard-chart-card" variant="borderless">
      <div className="dashboard-chart-header">
        <div>
          <Typography.Text className="section-eyebrow">客户覆盖</Typography.Text>
          <Typography.Title level={3} className="dashboard-chart-title">
            活跃持仓客户排名
          </Typography.Title>
          <Typography.Paragraph className="dashboard-chart-copy">
            用当前在持金额识别最需要维护的客户对象，帮助安排复盘、增配和联合路演节奏。
          </Typography.Paragraph>
        </div>
        <Tag variant="filled" className="dashboard-chart-tag">
          覆盖优先级
        </Tag>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-chart-empty">
          <Empty description="暂无活跃持仓客户数据" />
        </div>
      ) : (
        <ReactECharts option={option} notMerge lazyUpdate style={{ height: 360, width: "100%" }} />
      )}

      <Typography.Text className="dashboard-chart-insight">
        {items[0]
          ? `${items[0].clientName} 当前持仓居首，可优先安排下一轮深度沟通。`
          : "暂无可提炼的客户覆盖结论。"}
      </Typography.Text>
    </Card>
  );
}
